/**
 * PROVISIONAL SCHEMA
 * 
 * Module 3 types will reflect the currently agreed contract and remain
 * easy to extend when the logger/failure-analyser schema is finalized.
 */

export interface Module3LogEntry {
  log_id: string;
  query_id: string;
  timestamp: string;
  stage: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface Module3Response {
  status: 'success' | 'failed';
  logged_count: number;
}
