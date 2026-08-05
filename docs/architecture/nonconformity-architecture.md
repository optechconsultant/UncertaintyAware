# Non-conformity scorer architecture

This is Student 1's part of the project. The scorer takes a question and an LLM answer and returns one number from `0` to `1`.

- `0` means the answer looks like the safer examples we have seen.
- `1` means the answer looks unusual, unreliable, or failed.

The score is not a truth score. It is one signal that the flagger uses later. Student 2 decides the final route, not the scorer.

## What goes in

The scorer always needs the question and answer. It may also receive repeated answers to the same question, token log-probabilities, model settings, and response time.

Some model providers will not give every field. That is normal. The scorer must say when a signal was missing. It must not make up a value just so the output looks complete.

## What happens inside

1. Check that the input is usable.
2. If the model crashed, timed out, or gave an empty answer, return `1.0` straight away.
3. Extract whatever features are available. This may include answer agreement, token risk, or embedding distance.
4. Run the chosen scoring method.
5. Scale the result to `0` to `1` and return the score with a small explanation.

The full research plan for the possible methods is in [scoring design](../design/scoring-design.md).

## What comes out

```json
{
  "request_id": "request-123",
  "score": 0.18,
  "scorer_name": "sampling_consistency",
  "scorer_version": "git revision or version",
  "components": {
    "disagreement": 0.10,
    "token_risk": null,
    "embedding_distance": 0.23
  },
  "fault_penalised": false,
  "notes": ["Token log-probabilities were not provided by this backend."]
}
```

`null` means a signal was not available or was not used. It does not mean zero risk.

## When something goes wrong

| Problem | What the scorer does |
| --- | --- |
| Empty answer, crash, or timeout | Return `1.0`, set `fault_penalised` to `true`, and save the reason. |
| Missing optional field | Record it and use a method that does not need that field. |
| A calculation gives `NaN` or infinity | Treat it as a scoring failure. Do not silently clamp it. |
| Bad input shape | Return a structured error that names the bad field. |

## Keeping results repeatable

Every run should save the model name, prompt version, scorer version, settings, random seed, and normalisation rule. Once we calibrate, the score must stay fixed. If we change the formula, model, prompt, or embedding model, the old threshold might no longer mean the same thing.
