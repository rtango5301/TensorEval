/**
 * API Types
 * TypeScript interfaces for TensorEvalEngine API responses
 */

// ============================================
// Dataset Types
// ============================================

export type DatasetSource = 'generated' | 'uploaded' | 'built_in';
export type DatasetStatus = 'in_progress' | 'completed' | 'failed' | 'inactive';

// MCP Server types
export interface MCPServerBuiltIn {
  type: 'built_in';
  id: string;
  name: string;
}

export interface MCPServerCustom {
  type: 'custom';
  id: string;
  name: string;
  url: string;
  description?: string;
}

export type MCPServer = MCPServerBuiltIn | MCPServerCustom;

export interface GeneratedConfig {
  agent_name: string;
  agent_description: string;
  mcp_servers?: MCPServer[];
  concurrency?: number;
}

export interface RubricItem {
  name: string;
  rubric: string;
  weight: number;
}

export interface Dataset {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: DatasetStatus;
  source: DatasetSource;
  query_count: number;
  generated_config?: GeneratedConfig;
  created_at: string;
  updated_at?: string;
}

export interface DatasetQuery {
  id: string;
  dataset_id: string;
  query_id: string;
  query: string;
  reference_answer: string;
  category: string;
  rubric: RubricItem[];
  additional_context?: Record<string, unknown>;
  created_at: string;
}

export interface DatasetWithQueries extends Dataset {
  queries: DatasetQuery[];
}

// API Response wrapper types
export interface DatasetsListResponse {
  datasets: Dataset[];
}

export interface DatasetDetailResponse {
  dataset: DatasetWithQueries;
}

// Create Dataset Request types
export interface CreateDatasetGeneratedRequest {
  name: string;
  description?: string;
  source?: 'generated';
  agent_name: string;
  agent_description: string;
  mcp_servers?: MCPServer[];
  query_count?: number;
  concurrency?: number;
}

export interface CreateDatasetUploadedRequest {
  name: string;
  description?: string;
  source: 'uploaded';
  source_url: string;
  concurrency?: number;
}

export type CreateDatasetRequest = CreateDatasetGeneratedRequest | CreateDatasetUploadedRequest;

// ============================================
// Evaluation Types
// ============================================

export type EvaluationStatus = 'in_progress' | 'completed' | 'failed' | 'inactive';

export interface AgentConfig {
  name: string;
  url: string;
  model?: string;
  api_key_masked?: string;
  system_prompt?: string;
  description?: string;
  mcp_servers?: MCPServer[];
}

export interface ResultsSummary {
  overall_score: number;
  pass_rate: number;
  passed_count: number;
  failed_count: number;
  total_count: number;
  avg_latency_ms: number;
  per_rubric_averages?: Record<string, number>;
}

export interface EvaluationConfig {
  agent_config: AgentConfig;
  concurrency?: number;
}

export interface Evaluation {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: EvaluationStatus;
  dataset_id: string;
  dataset_name?: string;
  config: EvaluationConfig;
  results_summary?: ResultsSummary;
  progress?: string;
  created_at: string;
  updated_at?: string;
}

export interface EvaluationResult {
  id: string;
  evaluation_run_id: string;
  query_id: string;
  query: string;
  reference_answer: string;
  category: string;
  rubric: RubricItem[];
  agent_response: string;
  latency_ms: number;
  grader_reasoning: string;
  score: number;
  pass_fail: 'pass' | 'fail';
  created_at: string;
}

export interface EvaluationWithResults extends Evaluation {
  results: EvaluationResult[];
}

// API Response wrapper types for evaluations
export interface EvaluationsListResponse {
  evaluations: Evaluation[];
}

export interface AgentConfigRequest {
  name: string;
  url: string;
  model?: string;
  api_key?: string;
  system_prompt?: string;
  description?: string;
  mcp_servers?: MCPServer[];
}

export interface CreateEvaluationRequest {
  name: string;
  description?: string;
  dataset_id: string;
  agent_config: AgentConfigRequest;
  concurrency?: number;
}
