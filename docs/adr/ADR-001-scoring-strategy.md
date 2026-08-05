# ADR-001: Compare scores before choosing one

**Status:** agreed for the research phase

We do not know which score works best for free-form LLM answers. Token probabilities, repeated-answer agreement, embeddings, and combined scores all have weak points.

So we will implement and test at least three different scores on the same labelled development data. We will pick a final method only after looking at the results, cost, timing, and failure cases.

This means more work now, but it gives the project a real research result. It also gives us useful negative findings if a method does not work.

We will update this decision after the candidate comparison is complete.
