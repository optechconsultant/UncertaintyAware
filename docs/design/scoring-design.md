# Scoring design

## The basic idea

LLMs can be confidently wrong. A response may sound smooth and still contain a made-up fact. For that reason, we need something that looks at the whole answer, not just the probability of each word.

Our score will be between `0` and `1`. Bigger numbers should show up more often on wrong answers. We will only know whether a method works after comparing its scores with correctness labels.

We are not building a magic truth detector. We are trying to build a useful warning signal.

## Methods we will test

We need to implement at least three different methods. All methods must be tested on the same questions, answers, labels, model, and prompt settings.

### Repeated-answer consistency

Ask the model the same question several times. If the answers disagree, that can be a sign that the model is unsure.

We still need to choose how to compare answers. Exact text matching is too strict because two correct answers can use different words. Embedding similarity is easier to run, but it can miss a real contradiction. A semantic judge may be better, but then we also have to test the judge.

One simple version is:

```text
risk = 1 - average similarity(main answer, extra answers)
```

This can fail when the model repeats the same wrong claim each time. It also costs more because it needs extra model calls.

### Token log-probability

Some models tell us how likely each generated token was. We can combine those values over an answer and treat low average probability as more risk.

This is a baseline, not a final answer. It tells us whether the model found the wording familiar. It does not tell us whether the statement is true. A model can be very confident about a hallucination.

### Sampling entropy

This also uses repeated answers. We group answers that mean the same thing and measure how spread out the groups are. More spread can mean more uncertainty.

This may not work with a model that gives nearly the same answer every time. Its result also changes with the temperature and with the rule used to group similar answers.

### Distance from known-good answers

We can turn correct answers into embeddings and compare a new answer with them. If the new answer is far from similar good answers, its score goes up.

The risk is that a new but correct answer may be far away too. Embeddings also notice topic and writing style, not just correctness. We need to check this method by subject, not only as one overall number.

### A combined score

We may combine two or more signals. We should only do this if the combined score is clearly better than its best single part on development data.

If weights are learned from data, they must be learned on development data and fixed before calibration. We should start with something we can explain.

## Labels matter

We cannot compare methods without knowing which answers are correct. Exact string matching will not work for open answers. The label guide needs to say how we handle paraphrases, partly correct answers, missing details, and answers that mix a true statement with a false one.

We can use people, an automated check, or an LLM judge. If we use an LLM judge, we must save its model name, prompt, and a sample checked by people.

## Fair comparison

Each method will have raw values on a different scale. We can scale them to `0` to `1`, but the scaling rule must be learned from development data and then frozen. We must not adjust it after looking at the test set.

For every method, record accuracy-related measures, cost, latency, missing data, and failure examples. A method is not useful if it looks good in a chart but cannot run on our chosen model.

## What we will choose

We will prefer a score that puts wrong answers above correct answers often enough to be useful, stays similar across runs, works in more than one subject if possible, and does not take too long.

The proposal asks for at least `0.20` separation on one domain. We will state exactly how we measure that separation. Meeting that number is a project requirement, not proof that the system is safe for medical or other high-stakes use.
