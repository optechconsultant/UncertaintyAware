Stop-Process -Name "llama-server" -Force; Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue


python experiments/scripts/cli.py \
  --method semantic_entropy \
  --model llama3.2:1b \
  --judge-model llama3.2:latest \
  --dataset physics_1000.jsonl \
  --limit 50