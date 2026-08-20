from typing import Any, Tuple

def check_for_faults(model_output: Any) -> Tuple[bool, float, bool]:
    is_fault = False

    if model_output is None:
        is_fault = True
    elif isinstance(model_output, str) and not model_output.strip():
        is_fault = True
    elif isinstance(model_output, Exception):
        is_fault = True

    if is_fault:
        return True, 1.0, False

    return False, 0.0, True
