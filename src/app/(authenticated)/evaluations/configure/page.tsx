// Configure Evaluation - Step 2
// Route: /evaluations/configure
// Configure model settings, query configuration, and evaluation criteria

'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, Component, ReactNode } from 'react';

// ============================================================================
// ERROR BOUNDARY
// ============================================================================
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
            <h3 className="text-lg font-bold text-red-700 mb-2">Something went wrong</h3>
            <p className="text-sm text-red-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// MOCK AGENTS DATA
// ============================================================================
const agents = [
  {
    id: '1',
    name: 'Support Bot v2.4',
    emoji: '🤖',
    status: 'Active',
    accuracy: 94,
    category: 'Customer Service',
  },
  {
    id: '2',
    name: 'Data Analyst',
    emoji: '📊',
    status: 'Active',
    accuracy: 88,
    category: 'Data Processing',
  },
  {
    id: '3',
    name: 'Content Writer',
    emoji: '📝',
    status: 'Failing',
    accuracy: 68,
    category: 'Generative Text',
  },
];

// Model options
const modelOptions = [
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview', provider: 'OpenAI' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
];

// Query source options
type QuerySource = 'test-suite' | 'custom-range' | 'upload-csv';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
function ConfigureEvaluationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Safely get agentId from search params
  const getInitialAgentId = (): string | null => {
    try {
      return searchParams?.get('agentId') || null;
    } catch {
      return null;
    }
  };

  // Selected Agent State
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(getInitialAgentId);
  const [showAgentSelector, setShowAgentSelector] = useState(false);

  // Model Configuration State
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo-preview');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);

  // Query Configuration State
  const [querySource, setQuerySource] = useState<QuerySource>('test-suite');
  const [customStartIndex, setCustomStartIndex] = useState(1);
  const [customEndIndex, setCustomEndIndex] = useState(25);
  const [batchSize, setBatchSize] = useState(5);
  const [parallelWorkers, setParallelWorkers] = useState(3);

  // Evaluation Criteria State
  const [accuracyCheck, setAccuracyCheck] = useState(true);
  const [latencyThreshold, setLatencyThreshold] = useState(true);
  const [latencyMs, setLatencyMs] = useState(2000);
  const [securityScan, setSecurityScan] = useState(true);
  const [semanticSimilarity, setSemanticSimilarity] = useState(false);
  const [formatValidation, setFormatValidation] = useState(true);
  const [customRubric, setCustomRubric] = useState(false);

  // Get selected agent
  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Safe parseInt helper
  const safeParseInt = (
    value: string,
    defaultValue: number,
    min?: number,
    max?: number
  ): number => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return defaultValue;
    let result = parsed;
    if (min !== undefined) result = Math.max(result, min);
    if (max !== undefined) result = Math.min(result, max);
    return result;
  };

  // Handle start evaluation
  const handleStartEvaluation = () => {
    try {
      const evalId = crypto.randomUUID();
      router.push(`/evaluations/${evalId}`);
    } catch (error) {
      console.error('Failed to start evaluation:', error);
    }
  };

  // Stepper handlers
  const incrementBatchSize = () => setBatchSize((prev) => Math.min(prev + 1, 20));
  const decrementBatchSize = () => setBatchSize((prev) => Math.max(prev - 1, 1));
  const incrementWorkers = () => setParallelWorkers((prev) => Math.min(prev + 1, 10));
  const decrementWorkers = () => setParallelWorkers((prev) => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/evaluations" className="hover:text-[#135bec] transition-colors">
            Evaluations
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-slate-900 font-medium">Configure Evaluation</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configure Evaluation</h1>
        <p className="text-slate-500 text-sm">
          Set up your evaluation parameters and run tests on your agent.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 py-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-full bg-[#135bec] text-white text-sm font-bold">
            <span className="material-symbols-outlined text-lg">check</span>
          </div>
          <span className="text-sm font-medium text-[#135bec]">Select Agent</span>
        </div>
        <div className="flex-1 h-px bg-[#135bec] mx-2"></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-full bg-[#135bec] text-white text-sm font-bold">
            2
          </div>
          <span className="text-sm font-medium text-slate-900">Configure</span>
        </div>
        <div className="flex-1 h-px bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-full bg-slate-200 text-slate-500 text-sm font-bold">
            3
          </div>
          <span className="text-sm text-slate-500">Run</span>
        </div>
      </div>

      {/* ============================================= */}
      {/* SECTION 1: Selected Agent Card */}
      {/* ============================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-lg bg-[#135bec]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#135bec]">smart_toy</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">Selected Agent</h2>
            <p className="text-sm text-slate-500">The agent that will be evaluated</p>
          </div>
        </div>

        {selectedAgent ? (
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-sm">
                {selectedAgent.emoji}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedAgent.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedAgent.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${selectedAgent.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}
                    ></span>
                    {selectedAgent.status}
                  </span>
                  <span className="text-sm text-slate-500">
                    Accuracy:{' '}
                    <span className="font-semibold text-slate-700">{selectedAgent.accuracy}%</span>
                  </span>
                  <span className="text-sm text-slate-500">{selectedAgent.category}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAgentSelector(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#135bec] border border-[#135bec] rounded-lg hover:bg-[#135bec]/5 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">swap_horiz</span>
              Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAgentSelector(true)}
            className="w-full p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#135bec] hover:bg-[#135bec]/5 transition-all text-center"
          >
            <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">
              add_circle
            </span>
            <p className="text-sm font-medium text-slate-600">Click to select an agent</p>
          </button>
        )}
      </div>

      {/* ============================================= */}
      {/* SECTION 2: Model Configuration */}
      {/* ============================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-purple-600">psychology</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Model Configuration</h2>
            <p className="text-sm text-slate-500">Configure the LLM settings for this evaluation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all cursor-pointer"
            >
              {modelOptions.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Slider */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Temperature:{' '}
              <span className="font-normal text-[#135bec]">{temperature.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#135bec]"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0.0</span>
              <span>1.0</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Max Tokens</label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(safeParseInt(e.target.value, 2048, 1, 8192))}
              min="1"
              max="8192"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all"
            />
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* SECTION 3: Query Configuration */}
      {/* ============================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-600">quiz</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Query Configuration</h2>
            <p className="text-sm text-slate-500">Define which queries to run in this evaluation</p>
          </div>
        </div>

        {/* Query Source Radio Buttons */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-900 mb-3">Query Source</label>
          <div className="space-y-3">
            <label
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                querySource === 'test-suite'
                  ? 'border-[#135bec] bg-[#135bec]/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="querySource"
                value="test-suite"
                checked={querySource === 'test-suite'}
                onChange={() => setQuerySource('test-suite')}
                className="sr-only"
              />
              <div
                className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  querySource === 'test-suite' ? 'border-[#135bec]' : 'border-slate-300'
                }`}
              >
                {querySource === 'test-suite' && (
                  <div className="size-2.5 rounded-full bg-[#135bec]"></div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-900">Agent&apos;s Test Suite</span>
                <span className="text-sm text-slate-500 ml-2">(50 queries)</span>
              </div>
              <span className="material-symbols-outlined text-slate-400">folder</span>
            </label>

            <label
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                querySource === 'custom-range'
                  ? 'border-[#135bec] bg-[#135bec]/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="querySource"
                value="custom-range"
                checked={querySource === 'custom-range'}
                onChange={() => setQuerySource('custom-range')}
                className="sr-only"
              />
              <div
                className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  querySource === 'custom-range' ? 'border-[#135bec]' : 'border-slate-300'
                }`}
              >
                {querySource === 'custom-range' && (
                  <div className="size-2.5 rounded-full bg-[#135bec]"></div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-900">Custom Range</span>
              </div>
              <span className="material-symbols-outlined text-slate-400">tune</span>
            </label>

            <label
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                querySource === 'upload-csv'
                  ? 'border-[#135bec] bg-[#135bec]/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="querySource"
                value="upload-csv"
                checked={querySource === 'upload-csv'}
                onChange={() => setQuerySource('upload-csv')}
                className="sr-only"
              />
              <div
                className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  querySource === 'upload-csv' ? 'border-[#135bec]' : 'border-slate-300'
                }`}
              >
                {querySource === 'upload-csv' && (
                  <div className="size-2.5 rounded-full bg-[#135bec]"></div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-900">Upload CSV</span>
              </div>
              <span className="material-symbols-outlined text-slate-400">upload_file</span>
            </label>
          </div>
        </div>

        {/* Custom Range Inputs (conditional) */}
        {querySource === 'custom-range' && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Start Index</label>
                <input
                  type="number"
                  value={customStartIndex}
                  onChange={(e) => setCustomStartIndex(safeParseInt(e.target.value, 1, 1))}
                  min="1"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">End Index</label>
                <input
                  type="number"
                  value={customEndIndex}
                  onChange={(e) => setCustomEndIndex(safeParseInt(e.target.value, 25, 1))}
                  min="1"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Batch Size and Parallel Workers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Batch Size Stepper */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Batch Size</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrementBatchSize}
                disabled={batchSize <= 1}
                className="flex items-center justify-center size-10 rounded-lg border-2 border-slate-200 bg-white hover:border-[#135bec] hover:bg-[#135bec]/5 text-slate-600 hover:text-[#135bec] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-xl">remove</span>
              </button>
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) =>
                    setBatchSize(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))
                  }
                  min="1"
                  max="20"
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-lg text-slate-900 text-lg font-bold text-center focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all"
                />
              </div>
              <button
                type="button"
                onClick={incrementBatchSize}
                disabled={batchSize >= 20}
                className="flex items-center justify-center size-10 rounded-lg border-2 border-slate-200 bg-white hover:border-[#135bec] hover:bg-[#135bec]/5 text-slate-600 hover:text-[#135bec] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-xl">add</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Range: 1-20 queries per batch</p>
          </div>

          {/* Parallel Workers Stepper */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Parallel Workers</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrementWorkers}
                disabled={parallelWorkers <= 1}
                className="flex items-center justify-center size-10 rounded-lg border-2 border-slate-200 bg-white hover:border-[#135bec] hover:bg-[#135bec]/5 text-slate-600 hover:text-[#135bec] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-xl">remove</span>
              </button>
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={parallelWorkers}
                  onChange={(e) =>
                    setParallelWorkers(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))
                  }
                  min="1"
                  max="10"
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-lg text-slate-900 text-lg font-bold text-center focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] transition-all"
                />
              </div>
              <button
                type="button"
                onClick={incrementWorkers}
                disabled={parallelWorkers >= 10}
                className="flex items-center justify-center size-10 rounded-lg border-2 border-slate-200 bg-white hover:border-[#135bec] hover:bg-[#135bec]/5 text-slate-600 hover:text-[#135bec] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-xl">add</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Range: 1-10 concurrent workers</p>
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* SECTION 4: Evaluation Criteria */}
      {/* ============================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-green-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600">checklist</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Evaluation Criteria</h2>
            <p className="text-sm text-slate-500">Select which criteria to evaluate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Accuracy Check */}
          <label
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              accuracyCheck
                ? 'border-[#135bec] bg-[#135bec]/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={accuracyCheck}
              onChange={(e) => setAccuracyCheck(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`size-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                accuracyCheck ? 'border-[#135bec] bg-[#135bec]' : 'border-slate-300'
              }`}
            >
              {accuracyCheck && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-900">Accuracy Check</span>
              <p className="text-xs text-slate-500">Validate response correctness</p>
            </div>
          </label>

          {/* Latency Threshold */}
          <label
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              latencyThreshold
                ? 'border-[#135bec] bg-[#135bec]/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={latencyThreshold}
              onChange={(e) => setLatencyThreshold(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`size-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                latencyThreshold ? 'border-[#135bec] bg-[#135bec]' : 'border-slate-300'
              }`}
            >
              {latencyThreshold && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div>
                <span className="text-sm font-medium text-slate-900">Latency Threshold</span>
                <p className="text-xs text-slate-500">Max response time</p>
              </div>
              {latencyThreshold && (
                <input
                  type="number"
                  value={latencyMs}
                  onChange={(e) => setLatencyMs(safeParseInt(e.target.value, 2000, 100))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-sm text-slate-900 text-center focus:ring-2 focus:ring-[#135bec] focus:border-[#135bec] ml-auto"
                />
              )}
            </div>
            {latencyThreshold && <span className="text-xs text-slate-500">ms</span>}
          </label>

          {/* Security Scan */}
          <label
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              securityScan
                ? 'border-[#135bec] bg-[#135bec]/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={securityScan}
              onChange={(e) => setSecurityScan(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`size-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                securityScan ? 'border-[#135bec] bg-[#135bec]' : 'border-slate-300'
              }`}
            >
              {securityScan && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-900">Security Scan</span>
              <p className="text-xs text-slate-500">Check for vulnerabilities</p>
            </div>
          </label>

          {/* Semantic Similarity */}
          <label
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              semanticSimilarity
                ? 'border-[#135bec] bg-[#135bec]/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={semanticSimilarity}
              onChange={(e) => setSemanticSimilarity(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`size-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                semanticSimilarity ? 'border-[#135bec] bg-[#135bec]' : 'border-slate-300'
              }`}
            >
              {semanticSimilarity && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-900">Semantic Similarity</span>
              <p className="text-xs text-slate-500">Compare meaning with expected</p>
            </div>
          </label>

          {/* Format Validation */}
          <label
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formatValidation
                ? 'border-[#135bec] bg-[#135bec]/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={formatValidation}
              onChange={(e) => setFormatValidation(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`size-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                formatValidation ? 'border-[#135bec] bg-[#135bec]' : 'border-slate-300'
              }`}
            >
              {formatValidation && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-900">Format Validation</span>
              <p className="text-xs text-slate-500">Verify output structure</p>
            </div>
          </label>

          {/* Custom Rubric */}
          <label
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              customRubric
                ? 'border-[#135bec] bg-[#135bec]/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              checked={customRubric}
              onChange={(e) => setCustomRubric(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`size-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                customRubric ? 'border-[#135bec] bg-[#135bec]' : 'border-slate-300'
              }`}
            >
              {customRubric && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-900">Custom Rubric</span>
              <p className="text-xs text-slate-500">Use custom scoring criteria</p>
            </div>
          </label>
        </div>
      </div>

      {/* ============================================= */}
      {/* ACTION BAR */}
      {/* ============================================= */}
      <div className="flex items-center justify-between py-4">
        <Link
          href="/evaluations"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleStartEvaluation}
          disabled={!selectedAgent}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            selectedAgent
              ? 'bg-[#135bec] hover:bg-[#135bec]/90 text-white shadow-sm shadow-[#135bec]/30'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Start Evaluation
          <span className="material-symbols-outlined text-lg">play_arrow</span>
        </button>
      </div>

      {/* ============================================= */}
      {/* AGENT SELECTOR MODAL */}
      {/* ============================================= */}
      {showAgentSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Select Agent</h3>
              <button
                type="button"
                onClick={() => setShowAgentSelector(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => {
                    setSelectedAgentId(agent.id);
                    setShowAgentSelector(false);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                    selectedAgentId === agent.id
                      ? 'border-[#135bec] bg-[#135bec]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="size-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl">
                    {agent.emoji}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900">{agent.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          agent.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {agent.status}
                      </span>
                      <span className="text-xs text-slate-500">Accuracy: {agent.accuracy}%</span>
                    </div>
                  </div>
                  {selectedAgentId === agent.id && (
                    <span className="material-symbols-outlined text-[#135bec]">check_circle</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <button
                type="button"
                onClick={() => setShowAgentSelector(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConfigureEvaluationPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin size-8 border-2 border-slate-200 border-t-[#135bec] rounded-full"></div>
          </div>
        }
      >
        <ConfigureEvaluationContent />
      </Suspense>
    </ErrorBoundary>
  );
}
