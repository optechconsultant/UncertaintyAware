# System architecture

## What the system does

An application asks an LLM a question. ConformalGuard receives the answer and some details about the request. It gives the answer a score between `0` and `1`, then uses saved rules to return `PASS`, `REVIEW`, or `FLAG`.

`PASS` does not mean "definitely correct". It only means the answer did not look unusual according to the current score and calibration data. A high-risk answer may still be correct. This is why the middle route, `REVIEW`, is useful.

The whole flow is shown in the [system diagram](../diagrams/system-overview.md).

## What happens to one request

1. The application gets an answer from an LLM or RAG system.
2. An adapter turns that response into one common format.
3. The scorer calculates a risk score.
4. The flagger uses the active thresholds and picks a route.
5. The logger saves the question details, score, route, and versions used.
6. The dashboard reads the logs and shows what is happening. It does not change a decision by itself.

## How modules share data

The modules should not call into each other's private code. They exchange small data objects and use `pipeline_state.json` to know whether the system is calibrating or answering normal requests.

The adapter output looks roughly like this:

```json
{
  "request_id": "request-123",
  "question": "What is the SI unit of force?",
  "answer": "The SI unit of force is the newton.",
  "metadata": {
    "model": "model name",
    "prompt_version": "v1",
    "temperature": 0.2,
    "token_logprobs": null,
    "samples": []
  },
  "failure": null
}
```

If a call fails or returns nothing, the adapter must say so. It should not pretend that an empty answer is normal.

## Pipeline modes

| Mode | Meaning |
| --- | --- |
| `calibrate` | Build thresholds from labelled examples. |
| `inference` | Use saved thresholds for normal requests. |
| `test` | Show internal values while developing. |
| `recalibrate` | Build a replacement calibration result. |
| `status` | Read the current state only. |

While calibration is running, normal requests should get `CALIBRATING`. We should not use a half-written result file.

## A few rules

- Keep model failures in the data. They are part of real system behaviour.
- Save the scorer version, model version, prompt version, and calibration ID with each decision.
- Do not log API keys, access tokens, or private data that we do not need.
- Archive an old calibration result before replacing it.
- If the model, prompt, or scoring method changes, check whether we need to calibrate again.
