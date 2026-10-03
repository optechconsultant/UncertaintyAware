import json

input_file = "physics_1000.jsonl"

train_file = "physics_700.json"
test_file = "physics_300.json"

# Read the 1000 questions
with open(input_file, "r", encoding="utf-8") as file:
    questions = [json.loads(line) for line in file if line.strip()]

# Split into 700 and 300
questions_700 = questions[:700]
questions_300 = questions[700:1000]

# Write the 700 questions
with open(train_file, "w", encoding="utf-8") as file:
    json.dump(questions_700, file, indent=2)

# Write the 300 questions
with open(test_file, "w", encoding="utf-8") as file:
    json.dump(questions_300, file, indent=2)

print(f"Reference questions: {len(questions_700)}")
print(f"Test questions: {len(questions_300)}")