import json
import ollama
import numpy as np
from scipy.spatial.distance import cosine
from dotenv import set_key

questions = []

with open("physics_700.json", "r", encoding="utf-8") as file:
    data = json.load(file)

for item in data:
    questions.append(item["question"])


# Generate embeddings
embeddings = []

for question in questions:
    response = ollama.embed(
        model="nomic-embed-text",
        input=question
    )

    embeddings.append(response["embeddings"][0])

print("Embeddings generated:", len(embeddings))


# Calculate centroid
centroid = []

for i in range(len(embeddings[0])):
    total = 0

    for embedding in embeddings:
        total += embedding[i]

    centroid.append(total / len(embeddings))

print("Centroid length:", len(centroid))


# Calculate distances
distances = []

for embedding in embeddings:

    distance = cosine(embedding, centroid)

    distances.append(distance)


# Sort distances
sorted_results = sorted(
    enumerate(distances, start=1),
    key=lambda x: x[1]
)


# Print results
for question_number, distance in sorted_results:

    print(
        f"{question_number:3d} | "
        f"{distance:.6f} | "
        f"{questions[question_number - 1]}"
    )


# Calculate 95th percentile threshold
threshold = np.percentile(distances, 95)

print("Threshold:", threshold)


# Store ONLY question number, question and distance
results = []

for question_number, distance in sorted_results:

    results.append({
        "question_number": question_number,
        "question": questions[question_number - 1],
        "distance": float(distance)
    })


with open("threshold_results.json", "w", encoding="utf-8") as file:
    json.dump(results, file, indent=2)


# Store threshold and centroid directly in .env
env_file = ".env"

set_key(
    env_file,
    "THRESHOLD",
    str(float(threshold))
)

set_key(
    env_file,
    "CENTROID",
    json.dumps(centroid)
)

print("THRESHOLD and CENTROID saved to .env")