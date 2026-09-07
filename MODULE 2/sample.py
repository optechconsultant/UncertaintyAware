import ollama

physics_questions = [
    "What is Newton's second law of motion?",
    "What is the formula for kinetic energy?",
    "Explain the concept of gravity.",
    "What is Ohm's law?",
    "What is momentum?",
    "What is acceleration?"
]

embeddings = []

for question in physics_questions:
    response = ollama.embed(
        model="nomic-embed-text",
        input=question
    )

    embeddings.append(response["embeddings"][0])

centroid = []

for i in range(len(embeddings[0])):
    total = 0

    for embedding in embeddings:
        total += embedding[i]

    centroid.append(total / len(embeddings))

print(len(centroid))
print(centroid)