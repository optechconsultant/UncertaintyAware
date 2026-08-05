# ConformalGuard

ConformalGuard sits between an application and its language model. It takes the model's answer, gives it a risk score, and decides whether the answer can pass, should be reviewed, or should be flagged.

It is not trying to prove that an answer is true. The point is to catch answers that look unlike the answers we normally trust.

## Where to start

If you are new to the project, read these files in order:

1. [System architecture](architecture/system-architecture.md)
2. [Scoring design](design/scoring-design.md)
3. [Scorer architecture](architecture/nonconformity-architecture.md)
4. [Calibration](design/calibration-design.md)
5. [Evaluation plan](research/evaluation-plan.md)

The [open decisions](OPEN_DECISIONS.md) file is important too. It lists things we have not decided yet. We should not hide those gaps by writing as if the research is already done.

The two diagrams are in [diagrams](diagrams/).
