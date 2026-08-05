# Evaluation plan

## What we are trying to find out

Which scoring method gives the most useful warning signal for our chosen LLM and question sets?

We are not trying to prove that one method wins for every model or every subject. We are trying to make a careful claim about the setup we actually test.

## Data and labels

The proposal mentions Physics, Medical, and Math/Coding data. Before an experiment starts, we must note the dataset source, version, licence, number of questions, answer format, and any filtering we did.

Every generated answer needs a label. The label guide should cover correct answers, different correct wording, partly correct answers, and answers with one good fact and one bad fact. We should double-check a sample of labels so we know whether people or an automated judge are being consistent.

## How one experiment runs

1. Fix the dataset, model, prompt, temperature, decoding settings, and seed.
2. Generate the main answers and any extra samples a method needs.
3. Label every answer, including empty answers and failures.
4. Run every candidate score on the same items.
5. Compare the candidates on development data.
6. Pick one method and freeze its settings.
7. Calibrate that fixed method.
8. Test the completed pipeline on held-out data.

If the test result gives us a new idea, that is a new experiment. We should not tune the same test set until it gives a good answer.

## What we will measure

| Measure | Why we need it |
| --- | --- |
| AUROC | Checks whether wrong answers usually get higher scores. |
| Separation measure | Shows how far correct and wrong score groups are apart. |
| Route precision and recall | Tells us what `PASS`, `REVIEW`, and `FLAG` mean in practice. |
| Coverage | Checks the calibrated result on unseen data. |
| Latency and extra calls | Shows whether the method is practical. |
| Missing data and failures | Shows whether it works with a real adapter. |
| Results by subject | Stops one strong subject from hiding a weak one. |

Small datasets can give noisy results. Where possible, report a confidence interval or results over repeated splits instead of one number only.

## Baselines

We will compare the same questions and answers in three ways:

1. Raw LLM output with no middleware.
2. A token log-probability cut-off.
3. ConformalGuard with the score we choose.

We will compare answer quality after routing, review workload, wrong answers that passed, correct answers that were flagged, and latency. The proposal asks for a paired t-test and Cohen's d. If that test does not fit the data, we will explain the reason and use a more suitable paired test.

## Rules for picking a method

The winner should separate correct and wrong answers, be reasonably stable across runs, work with the chosen adapter, and not be too slow. A combined score must do better than its best part on held-out development data.

The proposal requires separation of at least `0.20` in one subject, a coverage check at `alpha = 0.10`, and a test that model failures get score `1.0`. Those are minimum checks only.

## Keep bad results

We should keep examples where the system got it wrong. We should also report methods that failed. For example, if entropy is almost zero because the model gives the same answer every time, that is a useful result.

For every run, save the code revision, model, prompt, settings, data, labels, raw score parts, timing, errors, and final measures. Someone else should be able to follow what happened.
