# Open decisions

These are questions we still need to answer. They are here so that everyone knows what is fixed and what is still being researched.

## About the score

- Which three scoring methods will we test first?
- How should we compare two answers that say the same thing in different words?
- Do we have access to token log-probabilities for the model we use?
- How many extra answers should we generate for the consistency method?
- If we combine signals, should the weights be fixed or learned from data?

## About the data

- Which datasets can we use legally and with clear answer keys?
- Which subjects should be part of the first experiment?
- What do we call correct, partly correct, and wrong?
- Who checks the labels when an answer is unclear?

## About calibration

- What exactly does our conformal threshold control?
- How will we set the `PASS`, `REVIEW`, and `FLAG` cut-offs?
- When should a model or prompt change force a new calibration?

## About running the project

- Which local model will we use first?
- How slow or expensive can scoring be before it becomes impractical?
- What details are safe to store in the log?
