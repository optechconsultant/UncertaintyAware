import sys
import os
import json
import argparse
import random
import yaml
import numpy as np
from tqdm import tqdm

try:
    import msvcrt
    has_msvcrt = True
except ImportError:
    has_msvcrt = False
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))
from scorer import Scorer
from scorer.llm_client import LLMClient

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def get_data_files(data_dir: str):
    if not os.path.exists(data_dir):
        return []
    return [f for f in os.listdir(data_dir) if os.path.isfile(os.path.join(data_dir, f))]

def load_and_split_dataset(filepath: str, limit: int = None, seed: int = 42):
    """
    Loads dataset, limits it if requested, and randomly splits into 
    Train (40%), Calibration (40%), and Evaluation (20%).
    """
    records = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip():
                continue
            try:
                records.append(json.loads(line))
                if limit and len(records) >= limit:
                    break
            except json.JSONDecodeError:
                continue

    random.seed(seed)
    random.shuffle(records)

    n = len(records)
    train_end = int(n * 0.4)
    calib_end = int(n * 0.8)

    return {
        'train': records[:train_end],
        'calibration': records[train_end:calib_end],
        'evaluation': records[calib_end:]
    }

def process_split(split_data, llm_client, split_name):
    """Processes a list of records through the LLMClient."""
    processed = []
    print(f"\nProcessing {split_name} split ({len(split_data)} records) with Ollama...")
    for record in tqdm(split_data):
        res = llm_client.process_record(record)
        processed.append(res)
    return processed

def select_menu_windows(title: str, options: list) -> int:
    selected_idx = 0
    while True:
        clear_screen()
        print("=================================================")
        print("   Conformal Guard: Non-Conformity Scorer CLI    ")
        print("=================================================\n")
        print(title + "\n")

        for i, option in enumerate(options):
            if i == selected_idx:
                print(f"  > {option}")
            else:
                print(f"    {option}")

        print("\n(Use Up/Down Arrow keys to navigate, Enter to select)")

        key = msvcrt.getch()
        if key in (b'\xe0', b'\x00'):
            key = msvcrt.getch()
            if key == b'H':
                selected_idx = max(0, selected_idx - 1)
            elif key == b'P':
                selected_idx = min(len(options) - 1, selected_idx + 1)
        elif key == b'\r':
            return selected_idx
        elif key == b'\x03':
            sys.exit(0)

def select_menu_fallback(title: str, options: list) -> int:
    clear_screen()
    print(title)
    for i, option in enumerate(options):
        print(f"  {i + 1}. {option}")

    while True:
        try:
            choice = int(input(f"Select (1-{len(options)}): ").strip())
            if 1 <= choice <= len(options):
                return choice - 1
        except ValueError:
            pass
        print("Invalid choice.")

def select_menu(title: str, options: list) -> int:
    if has_msvcrt:
        return select_menu_windows(title, options)
    else:
        return select_menu_fallback(title, options)

def interactive_menu(data_dir: str):
    method_options = ["Semantic Entropy (Method 3)", "Mahalanobis Distance (Method 4)"]
    method_idx = select_menu("Select a candidate method:", method_options)
    method = 'semantic_entropy' if method_idx == 0 else 'mahalanobis'

    files = get_data_files(data_dir)
    if not files:
        print(f"\n[Error] No datasets found in '{data_dir}'.")
        sys.exit(1)

    dataset_idx = select_menu("Select a dataset:", files)
    dataset_path = os.path.join(data_dir, files[dataset_idx])

    clear_screen()
    print(f"Selected Method  : {method_options[method_idx]}")
    print(f"Selected Dataset : {files[dataset_idx]}\n")

    limit_input = input("How many questions to process? (Leave blank for ALL): ").strip()
    limit = None
    if limit_input != "":
        try:
            limit = int(limit_input)
            if limit <= 0: limit = None
        except ValueError:
            limit = None

    return method, dataset_path, limit

def main():
    parser = argparse.ArgumentParser(description="Conformal Guard Scorer CLI")
    parser.add_argument('--method', type=str, choices=['semantic_entropy', 'mahalanobis'])
    parser.add_argument('--dataset', type=str)
    parser.add_argument('--limit', type=int)

    args = parser.parse_args()
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data'))
    config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../configs/default.yaml'))

    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)

    if args.method and args.dataset:
        method = args.method
        dataset_path = os.path.join(data_dir, args.dataset)
        limit = args.limit
    else:
        method, dataset_path, limit = interactive_menu(data_dir)

    scorer_cfg = config.get('scorer', {})
    if method == 'semantic_entropy':
        se_cfg = scorer_cfg.get('semantic_entropy', {})
        method_kwargs = {
            'use_exact_match': se_cfg.get('use_exact_match', False),
            'similarity_threshold': se_cfg.get('similarity_threshold', 0.95),
        }
    else:
        mah_cfg = scorer_cfg.get('mahalanobis', {})
        method_kwargs = {'normalization_scale': mah_cfg.get('normalization_scale', 5.0)}

    clear_screen()
    print("-------------------------------------------------")
    print(f"> Processing Dataset : {os.path.basename(dataset_path)}")
    print(f"> Method             : {method}")
    print(f"> Generation Model   : {config['generation']['llm_model']}")
    print(f"> Limit              : {'ALL' if limit is None else limit} questions")
    print("-------------------------------------------------\n")

    splits = load_and_split_dataset(dataset_path, limit=limit)
    if not any(splits.values()):
        print("Dataset is empty. Exiting.")
        sys.exit(1)

    llm_client = LLMClient(config)
    train_processed = process_split(splits['train'], llm_client, "Train")
    calib_processed = process_split(splits['calibration'], llm_client, "Calibration")

    scorer = Scorer(method=method, method_kwargs=method_kwargs)

    if method == 'mahalanobis':
        print("\nFitting Mahalanobis centroid on Train split...")
        correct_train_embs = [item['embedding'] for item in train_processed if item['is_correct']]
        if not correct_train_embs:
            print("WARNING: No correct answers in Train split to fit Mahalanobis. It will crash or behave poorly.")
        else:
            scorer.candidate.fit(np.array(correct_train_embs))

    artifacts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../artifacts/calibration'))
    print(f"\nRunning Calibration (alpha=0.10) on Calibration split...")

    try:
        scorer.calibrate(calib_processed, alpha=0.10, config=config, artifacts_dir=artifacts_dir)
        print("\nCalibration Complete!")
        print(f"Results saved to: {artifacts_dir}")
        print("\n--- Conformal Thresholds ---")
        print(f"  q_hat (Cutoff) : {scorer.q_hat:.4f}")
        print(f"  theta_low      : {scorer.theta_low:.4f} (PASS zone)")
        print(f"  theta_high     : {scorer.theta_high:.4f} (FLAG zone)")
        print("-------------------------------------------------")

        # Signal validation: wrong answers should score higher than correct ones.
        # If both means are equal the scorer has no predictive power.
        import json
        with open(os.path.join(artifacts_dir, 'calibration_results.json')) as _f:
            _cal = json.load(_f)
        _sep = _cal.get('separation_stats', {})
        _correct_mean = _sep.get('correct_mean', 0.0)
        _wrong_mean   = _sep.get('wrong_mean')
        print("\n--- Signal Validation ---")
        if _wrong_mean is None:
            print("  [WARN] No wrong examples in calibration set — cannot validate signal.")
        elif _wrong_mean <= _correct_mean:
            print(f"  [WARN] wrong_mean ({_wrong_mean:.4f}) <= correct_mean ({_correct_mean:.4f})")
            print("         Scorer has NO predictive signal. q_hat is meaningless.")
            print("         Check: similarity_threshold, embedding model, or data quality.")
        else:
            print(f"  [OK]   wrong_mean ({_wrong_mean:.4f}) > correct_mean ({_correct_mean:.4f})")
            print("         Scorer has predictive signal. Calibration is valid.")
        print("-------------------------------------------------\n")
    except Exception as e:
        print(f"\n[ERROR] Calibration failed: {e}")

if __name__ == "__main__":
    main()
