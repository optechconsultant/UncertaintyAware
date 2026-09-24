import json 
import ollama
import numpy as np
from scipy.spatial.distance import cosine
questions=[]

with open("questions_400.jsonl","r",encoding="utf-8") as file:
    data=json.load(file)
for item in data:
    questions.append(item["question"])
embeddings=[]
for question in questions:
    response=ollama.embed(
        model="nomic-embed-text",
        input=question
    )
    embeddings.append(response["embeddings"][0])
print("Embeddings generated:", len(embeddings))
centroid = []

for i in range(len(embeddings[0])):
    total = 0

    for embedding in embeddings:
        total += embedding[i]

    centroid.append(total / len(embeddings))

print("Centroid length:", len(centroid))

distances = []

for i, embedding in enumerate(embeddings):

    distance = cosine(embedding, centroid)

    distances.append({
        "question": questions[i],
        "distance": distance
    })

distances.sort(key=lambda x: x["distance"])

for i, item in enumerate(distances, start=1):
    print(
        f"{i:3d} | "
        f"{item['distance']:.6f} | "
        f"{item['question']}"
    )
distance_values=[item["distance"] for item in distances]

threshold=np.percentile(distance_values,95)

print("Threshold:",threshold)
with open("threshold_results.json","w",encoding="utf-8") as file:
    json.dump({
        "threshold":float(threshold),
        "centroid":centroid,
        "distances":distances
    },file)