import json

input_file = "physics_1000.jsonl"
output_file = "questions_400.jsonl"

# Read the 1000 questions
with open(input_file, "r", encoding="utf-8") as file:
    questions = [json.loads(line) for line in file if line.strip()]

# Take the first 400 questions
questions_400 = questions[:400]

# Write them to a new JSON file
with open(output_file, "w", encoding="utf-8") as file:
    json.dump(questions_400, file, indent=2)

print(f"Extracted {len(questions_400)} questions.")