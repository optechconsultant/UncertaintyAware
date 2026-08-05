# ADR-002: Start with split conformal calibration

**Status:** proposed

The project proposal uses split conformal calibration for the main system. Student 5 will study cross-conformal prediction as a separate extension for small datasets.

We will start with split conformal calibration and keep development, calibration, and test data separate. It is easier to explain and gives us a clear baseline for Student 5's comparison.

The downside is that only part of the data is used to build the threshold. That can be a problem when the dataset is small. We will revisit this if the thresholds are unstable or if the extension gives a clearly better result for our use case.
