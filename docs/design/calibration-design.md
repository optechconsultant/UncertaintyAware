# Calibration design

## Why we need calibration

A score of `0.60` does not mean the same thing in every model or dataset. Calibration tells us what score values look normal for one fixed scorer, model, prompt, and set of examples.

We only calibrate after picking the score. In normal use, the system reads the saved thresholds. It does not quietly change them for each new question.

## Keep the data roles separate

We need three data splits:

| Split | What it is for |
| --- | --- |
| Development | Build and compare score methods. |
| Calibration | Turn the chosen fixed score into thresholds. |
| Test | Check the finished system on data it has not seen. |

If we use test results to change the score or cut-off, it is no longer a real test set.

## Starting method

The proposal uses split conformal calibration as the starting point. We sort the relevant calibration scores and choose a cut-off based on the chosen error level, `alpha`.

For the proposal's correct-answer setup, the suggested rank is:

```text
ceil((n + 1) * (1 - alpha))
```

`n` is the number of scores being used. Before coding this, we need to write down exactly which scores go into the list and what event the cut-off is meant to control. The formula is easy to copy and easy to use wrongly.

## The three routes

We may use two cut-offs for daily use:

| Score | Route | Plain meaning |
| --- | --- | --- |
| `score <= theta_low` | `PASS` | The answer does not look unusual. |
| Between the two cut-offs | `REVIEW` | Someone or another process should look at it. |
| `score > theta_high` | `FLAG` | The answer looks risky. |

These routes are a product rule, not a free mathematical guarantee. We have to measure how many answers land in each route and how many wrong answers still pass.

## What conformal prediction does and does not say

Under its assumptions, split conformal gives a finite-sample guarantee for the exact event we define. One important assumption is that future requests are similar enough to the calibration examples.

It does not say every passed answer is correct. It does not protect us if the model, prompt, or input domain changes a lot. It also cannot fix bad labels or a score that was changed after calibration.

## Saving results

`calibration_results.json` should save the calibration ID, score version, model and prompt details, dataset version, alpha, score-label pairs, thresholds, errors, and time of the run.

Write a new result first. Check it. Archive the old result. Then update `pipeline_state.json`. That order protects us if a recalibration fails halfway through.

## When to recalibrate

We should recalibrate after a score change, model change, prompt change, or a meaningful change in the kind of questions we receive. A drift alert should ask for a review; it should not automatically replace the active result.
