export interface Module1Response {
  answer: string;
  non_conformity_score: number;
  q_hat: number;
  theta_low: number;
  theta_high: number;
  cal_scores: number[];
  cal_labels: number[];
  separation: number;
  llm_model: string;
}
