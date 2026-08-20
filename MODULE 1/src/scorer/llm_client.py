import ollama
import numpy as np
from typing import List, Tuple, Any, Dict

from prompts.templates import JUDGE_SYSTEM_PROMPT, JUDGE_USER_PROMPT_TEMPLATE

class LLMClient:
    def __init__(self, config: dict):
        self.config = config
        self.llm_model = config['generation']['llm_model']
        self.temperature = config['generation']['temperature']
        self.num_samples = config['generation']['num_samples']
        self.embedding_model = config['embedding']['embedding_model']
        self.judge_model = config['judge']['judge_model']
        self.judge_temp = config['judge']['temperature']
    def generate_output_and_samples(self, prompt: str) -> Tuple[str, List[str]]:
        samples = []
        for _ in range(self.num_samples):
            response = ollama.chat(
                model=self.llm_model,
                messages=[{'role': 'user', 'content': prompt}],
                options={'temperature': self.temperature}
            )
            samples.append(response['message']['content'].strip())

        output = samples[0] if samples else ""
        return output, samples
    def get_embedding(self, text: str) -> np.ndarray:
        response = ollama.embeddings(
            model=self.embedding_model,
            prompt=text
        )
        return np.array(response['embedding'])
    def get_embeddings_batch(self, texts: List[str]) -> np.ndarray:
        return np.array([self.get_embedding(text) for text in texts])

    @staticmethod
    def compute_cosine_similarity_matrix(embeddings: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        normed = embeddings / np.clip(norms, a_min=1e-10, a_max=None)
        return normed @ normed.T
    def evaluate_correctness(self, question: str, generated_answer: str, reference_answers: List[str]) -> bool:
        refs = "\n- ".join(reference_answers)
        system_prompt = JUDGE_SYSTEM_PROMPT

        user_prompt = JUDGE_USER_PROMPT_TEMPLATE.format(
            question=question,
            refs=refs,
            generated_answer=generated_answer
        )

        response = ollama.chat(
            model=self.judge_model,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            options={'temperature': self.judge_temp}
        )

        result_text = response['message']['content'].strip().upper()
        if 'TRUE' in result_text:
            return True
        return False
    def process_record(self, record: dict) -> Dict:
        try:
            question = record['question']
            reference_answers = record.get('correct_answers', [record.get('best_answer', '')])

            output, samples = self.generate_output_and_samples(question)

            sample_embeddings = self.get_embeddings_batch(samples)
            similarity_matrix = self.compute_cosine_similarity_matrix(sample_embeddings)
            primary_embedding = sample_embeddings[0]

            is_correct = self.evaluate_correctness(question, output, reference_answers)

            return {
                'question': question,
                'output': output,
                'samples': samples,
                'embedding': primary_embedding,
                'similarity_matrix': similarity_matrix,
                'is_correct': is_correct,
            }

        except Exception as e:
            print(f"[Fault] Error processing record: {e}")
            return {
                'question': record.get('question'),
                'output': e,
                'samples': [],
                'embedding': np.zeros(1),
                'similarity_matrix': None,
                'is_correct': False,
            }
