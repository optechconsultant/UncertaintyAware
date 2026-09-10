import numpy as np
from typing import Union, List
def normalize_distance(distance: Union[float, np.ndarray, List[float]], 
                       scale_factor: float = 1.0) -> Union[float, np.ndarray, List[float]]:
    if scale_factor <= 0:
        raise ValueError("scale_factor must be positive.")

    is_list = isinstance(distance, list)
    is_float = isinstance(distance, (float, int))

    d_array = np.array(distance, dtype=float)
    d_array = np.maximum(d_array, 0.0)

    normalized = 1.0 - np.exp(-d_array / scale_factor)
    
    if is_float:
        return float(normalized)
    elif is_list:
        return normalized.tolist()

    return normalized
