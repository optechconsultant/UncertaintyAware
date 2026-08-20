JUDGE_SYSTEM_PROMPT = """You are an expert grading assistant. Your task is to evaluate if the STUDENT ANSWER is semantically equivalent to or correctly matches the REFERENCE ANSWERS for the given QUESTION.
The student answer might be paraphrased, partial but correct, or formulated differently. If it captures the core correct meaning, output 'TRUE'. Otherwise, output 'FALSE'.
Output ONLY the word TRUE or FALSE. Do not output anything else."""

JUDGE_USER_PROMPT_TEMPLATE = """QUESTION: {question}

REFERENCE ANSWERS:
- {refs}

STUDENT ANSWER: {generated_answer}"""