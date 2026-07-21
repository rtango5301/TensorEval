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
          <div className="max-w-md rounded-[8px] border border-[var(--error)]/20 bg-[var(--error)]/10 p-6 text-center">
            <span className="material-symbols-outlined mb-4 text-4xl text-[var(--error)]">
              error
            </span>
            <h3 className="mb-2 font-display text-lg font-bold text-[var(--error-foreground)]">
              Something went wrong
            </h3>
            <p className="mb-4 text-sm text-[var(--error-foreground)]">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-[4px] bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error-foreground)]"
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
      const evalId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
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
        <div className="mb-2 flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
          <Link href="/evaluations" className="transition-colors hover:text-[var(--primary)]">
            Evaluations
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="font-medium text-[var(--on-surface)]">Configure Evaluation</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--on-surface)]">
          Configure Evaluation
        </h1>
        <p className="text-sm text-[var(--on-surface-variant)]">
          Set up your evaluation parameters and run tests on your agent.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-[4px] bg-[var(--success)] text-sm font-bold text-white">
            <span className="material-symbols-outlined text-lg">check</span>
          </div>
          <span className="text-sm font-medium text-[var(--success-foreground)]">Select Agent</span>
        </div>
        <div className="mx-2 h-px flex-1 bg-[var(--success)]"></div>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-[4px] bg-[var(--primary)] text-sm font-bold text-white">
            2
          </div>
          <span className="text-sm font-medium text-[var(--on-surface)]">Configure</span>
        </div>
        <div className="mx-2 h-px flex-1 bg-[var(--surface-container)]"></div>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-[4px] bg-[var(--surface-container)] text-sm font-bold text-[var(--on-surface-variant)]">
            3
          </div>
          <span className="text-sm text-[var(--on-surface-variant)]">Run</span>
        </div>
      </div>

      {/* ============================================= */}
      {/* SECTION 1: Selected Agent Card */}
      {/* ============================================= */}
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-[8px] bg-[var(--surface-container-low)]">
            <span className="material-symbols-outlined text-[var(--primary)]">smart_toy</span>
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-[var(--on-surface)]">
              Selected Agent
            </h2>
            <p className="text-sm text-[var(--on-surface-variant)]">
              The agent that will be evaluated
            </p>
          </div>
        </div>

        {selectedAgent ? (
          <div className="flex items-center justify-between rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-[8px] border border-[var(--outline-variant)] bg-white text-2xl">
                {selectedAgent.emoji}
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[var(--on-surface)]">
                  {selectedAgent.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-xs font-medium ${
                      selectedAgent.status === 'Active'
                        ? 'bg-[var(--success)]/10 text-[var(--success-foreground)]'
                        : 'bg-[var(--error)]/10 text-[var(--error-foreground)]'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-[2px] ${selectedAgent.status === 'Active' ? 'bg-[var(--success)]' : 'bg-[var(--error)]'}`}
                    ></span>
                    {selectedAgent.status}
                  </span>
                  <span className="text-sm text-[var(--on-surface-variant)]">
                    Accuracy:{' '}
                    <span className="font-mono font-semibold text-[var(--on-surface-variant)]">
                      {selectedAgent.accuracy}%
                    </span>
                  </span>
                  <span className="text-sm text-[var(--on-surface-variant)]">
                    {selectedAgent.category}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAgentSelector(true)}
              className="flex items-center gap-2 rounded-[4px] border border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--surface-container-low)]"
            >
              <span className="material-symbols-outlined text-lg">swap_horiz</span>
              Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAgentSelector(true)}
            className="w-full rounded-[4px] border-2 border-dashed border-[var(--outline)] p-6 text-center transition-colors hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)]"
          >
            <span className="material-symbols-outlined mb-2 text-3xl text-[var(--outline)]">
              add_circle
            </span>
            <p className="text-sm font-medium text-[var(--on-surface-variant)]">
              Click to select an agent
            </p>
          </button>
        )}
      </div>

      {/* ============================================= */}
      {/* SECTION 2: Model Configuration */}
      {/* ============================================= */}
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-[8px] bg-[var(--brand-secondary)]/10">
            <span className="material-symbols-outlined text-[var(--brand-secondary)]">
              psychology
            </span>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--on-surface)]">
              Model Configuration
            </h2>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Configure the LLM settings for this evaluation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Model Selection */}
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--on-surface)]">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full cursor-pointer rounded-[4px] border border-[var(--outline-variant)] bg-white px-4 py-3 text-sm text-[var(--on-surface)] transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--brand-highlight)]"
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
            <label className="mb-2 block text-sm font-bold text-[var(--on-surface)]">
              Temperature:{' '}
              <span className="font-mono font-normal text-[var(--primary)]">
                {temperature.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-[4px] bg-[var(--surface-container)] accent-[var(--primary)]"
            />
            <div className="mt-1 flex justify-between font-mono text-xs text-[var(--outline)]">
              <span>0.0</span>
              <span>1.0</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--on-surface)]">
              Max Tokens
            </label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(safeParseInt(e.target.value, 2048, 1, 8192))}
              min="1"
              max="8192"
              className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white px-4 py-3 font-mono text-sm text-[var(--on-surface)] transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--brand-highlight)]"
            />
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* SECTION 3: Query Configuration */}
      {/* ============================================= */}
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-[8px] bg-[var(--surface-container-low)]">
            <span className="material-symbols-outlined text-[var(--primary)]">quiz</span>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--on-surface)]">
              Query Configuration
            </h2>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Define which queries to run in this evaluation
            </p>
          </div>
        </div>

        {/* Query Source Radio Buttons */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-bold text-[var(--on-surface)]">
            Query Source
          </label>
          <div className="space-y-3">
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-[4px] border-2 p-4 transition-colors ${
                querySource === 'test-suite'
                  ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                  : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
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
                  querySource === 'test-suite'
                    ? 'border-[var(--primary)]'
                    : 'border-[var(--outline)]'
                }`}
              >
                {querySource === 'test-suite' && (
                  <div className="size-2.5 rounded-full bg-[var(--primary)]"></div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-[var(--on-surface)]">
                  Agent&apos;s Test Suite
                </span>
                <span className="ml-2 font-mono text-sm text-[var(--on-surface-variant)]">
                  (50 queries)
                </span>
              </div>
              <span className="material-symbols-outlined text-[var(--outline)]">folder</span>
            </label>

            <label
              className={`flex cursor-pointer items-center gap-3 rounded-[4px] border-2 p-4 transition-colors ${
                querySource === 'custom-range'
                  ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                  : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
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
                  querySource === 'custom-range'
                    ? 'border-[var(--primary)]'
                    : 'border-[var(--outline)]'
                }`}
              >
                {querySource === 'custom-range' && (
                  <div className="size-2.5 rounded-full bg-[var(--primary)]"></div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-[var(--on-surface)]">Custom Range</span>
              </div>
              <span className="material-symbols-outlined text-[var(--outline)]">tune</span>
            </label>

            <label
              className={`flex cursor-pointer items-center gap-3 rounded-[4px] border-2 p-4 transition-colors ${
                querySource === 'upload-csv'
                  ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                  : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
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
                  querySource === 'upload-csv'
                    ? 'border-[var(--primary)]'
                    : 'border-[var(--outline)]'
                }`}
              >
                {querySource === 'upload-csv' && (
                  <div className="size-2.5 rounded-full bg-[var(--primary)]"></div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-[var(--on-surface)]">Upload CSV</span>
              </div>
              <span className="material-symbols-outlined text-[var(--outline)]">upload_file</span>
            </label>
          </div>
        </div>

        {/* Custom Range Inputs (conditional) */}
        {querySource === 'custom-range' && (
          <div className="mb-6 rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--on-surface)]">
                  Start Index
                </label>
                <input
                  type="number"
                  value={customStartIndex}
                  onChange={(e) => setCustomStartIndex(safeParseInt(e.target.value, 1, 1))}
                  min="1"
                  className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white px-4 py-3 font-mono text-sm text-[var(--on-surface)] transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--on-surface)]">
                  End Index
                </label>
                <input
                  type="number"
                  value={customEndIndex}
                  onChange={(e) => setCustomEndIndex(safeParseInt(e.target.value, 25, 1))}
                  min="1"
                  className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white px-4 py-3 font-mono text-sm text-[var(--on-surface)] transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Batch Size and Parallel Workers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Batch Size Stepper */}
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--on-surface)]">
              Batch Size
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrementBatchSize}
                disabled={batchSize <= 1}
                className="flex size-10 items-center justify-center rounded-[4px] border-2 border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--outline-variant)] disabled:hover:bg-white disabled:hover:text-[var(--on-surface-variant)]"
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
                  className="w-full rounded-[4px] border-2 border-[var(--outline-variant)] bg-white px-4 py-2.5 text-center font-mono text-lg font-bold text-[var(--on-surface)] transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
              </div>
              <button
                type="button"
                onClick={incrementBatchSize}
                disabled={batchSize >= 20}
                className="flex size-10 items-center justify-center rounded-[4px] border-2 border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--outline-variant)] disabled:hover:bg-white disabled:hover:text-[var(--on-surface-variant)]"
              >
                <span className="material-symbols-outlined text-xl">add</span>
              </button>
            </div>
            <p className="mt-1 font-mono text-xs text-[var(--on-surface-variant)]">
              Range: 1-20 queries per batch
            </p>
          </div>

          {/* Parallel Workers Stepper */}
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--on-surface)]">
              Parallel Workers
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrementWorkers}
                disabled={parallelWorkers <= 1}
                className="flex size-10 items-center justify-center rounded-[4px] border-2 border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--outline-variant)] disabled:hover:bg-white disabled:hover:text-[var(--on-surface-variant)]"
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
                  className="w-full rounded-[4px] border-2 border-[var(--outline-variant)] bg-white px-4 py-2.5 text-center font-mono text-lg font-bold text-[var(--on-surface)] transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
              </div>
              <button
                type="button"
                onClick={incrementWorkers}
                disabled={parallelWorkers >= 10}
                className="flex size-10 items-center justify-center rounded-[4px] border-2 border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--outline-variant)] disabled:hover:bg-white disabled:hover:text-[var(--on-surface-variant)]"
              >
                <span className="material-symbols-outlined text-xl">add</span>
              </button>
            </div>
            <p className="mt-1 font-mono text-xs text-[var(--on-surface-variant)]">
              Range: 1-10 concurrent workers
            </p>
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* SECTION 4: Evaluation Criteria */}
      {/* ============================================= */}
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-[8px] bg-[var(--success)]/10">
            <span className="material-symbols-outlined text-[var(--success)]">checklist</span>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--on-surface)]">
              Evaluation Criteria
            </h2>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Select which criteria to evaluate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Accuracy Check */}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-[4px] border-2 p-4 transition-colors ${
              accuracyCheck
                ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
            }`}
          >
            <input
              type="checkbox"
              checked={accuracyCheck}
              onChange={(e) => setAccuracyCheck(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors ${
                accuracyCheck
                  ? 'border-[var(--primary)] bg-[var(--primary)]'
                  : 'border-[var(--outline)]'
              }`}
            >
              {accuracyCheck && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-[var(--on-surface)]">Accuracy Check</span>
              <p className="text-xs text-[var(--on-surface-variant)]">
                Validate response correctness
              </p>
            </div>
          </label>

          {/* Latency Threshold */}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-[4px] border-2 p-4 transition-colors ${
              latencyThreshold
                ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
            }`}
          >
            <input
              type="checkbox"
              checked={latencyThreshold}
              onChange={(e) => setLatencyThreshold(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors ${
                latencyThreshold
                  ? 'border-[var(--primary)] bg-[var(--primary)]'
                  : 'border-[var(--outline)]'
              }`}
            >
              {latencyThreshold && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div>
                <span className="text-sm font-medium text-[var(--on-surface)]">
                  Latency Threshold
                </span>
                <p className="text-xs text-[var(--on-surface-variant)]">Max response time</p>
              </div>
              {latencyThreshold && (
                <input
                  type="number"
                  value={latencyMs}
                  onChange={(e) => setLatencyMs(safeParseInt(e.target.value, 2000, 100))}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-auto w-20 rounded-[4px] border border-[var(--outline-variant)] bg-white px-2 py-1 text-center font-mono text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
              )}
            </div>
            {latencyThreshold && (
              <span className="font-mono text-xs text-[var(--on-surface-variant)]">ms</span>
            )}
          </label>

          {/* Security Scan */}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-[4px] border-2 p-4 transition-colors ${
              securityScan
                ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
            }`}
          >
            <input
              type="checkbox"
              checked={securityScan}
              onChange={(e) => setSecurityScan(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors ${
                securityScan
                  ? 'border-[var(--primary)] bg-[var(--primary)]'
                  : 'border-[var(--outline)]'
              }`}
            >
              {securityScan && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-[var(--on-surface)]">Security Scan</span>
              <p className="text-xs text-[var(--on-surface-variant)]">Check for vulnerabilities</p>
            </div>
          </label>

          {/* Semantic Similarity */}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-[4px] border-2 p-4 transition-colors ${
              semanticSimilarity
                ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
            }`}
          >
            <input
              type="checkbox"
              checked={semanticSimilarity}
              onChange={(e) => setSemanticSimilarity(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors ${
                semanticSimilarity
                  ? 'border-[var(--primary)] bg-[var(--primary)]'
                  : 'border-[var(--outline)]'
              }`}
            >
              {semanticSimilarity && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-[var(--on-surface)]">
                Semantic Similarity
              </span>
              <p className="text-xs text-[var(--on-surface-variant)]">
                Compare meaning with expected
              </p>
            </div>
          </label>

          {/* Format Validation */}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-[4px] border-2 p-4 transition-colors ${
              formatValidation
                ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
            }`}
          >
            <input
              type="checkbox"
              checked={formatValidation}
              onChange={(e) => setFormatValidation(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors ${
                formatValidation
                  ? 'border-[var(--primary)] bg-[var(--primary)]'
                  : 'border-[var(--outline)]'
              }`}
            >
              {formatValidation && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-[var(--on-surface)]">
                Format Validation
              </span>
              <p className="text-xs text-[var(--on-surface-variant)]">Verify output structure</p>
            </div>
          </label>

          {/* Custom Rubric */}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-[4px] border-2 p-4 transition-colors ${
              customRubric
                ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
            }`}
          >
            <input
              type="checkbox"
              checked={customRubric}
              onChange={(e) => setCustomRubric(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors ${
                customRubric
                  ? 'border-[var(--primary)] bg-[var(--primary)]'
                  : 'border-[var(--outline)]'
              }`}
            >
              {customRubric && (
                <span className="material-symbols-outlined text-white text-xs">check</span>
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-[var(--on-surface)]">Custom Rubric</span>
              <p className="text-xs text-[var(--on-surface-variant)]">
                Use custom scoring criteria
              </p>
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
          className="flex items-center gap-2 rounded-[4px] px-4 py-2 text-sm font-medium text-[var(--on-surface-variant)] transition-colors hover:text-[var(--on-surface)]"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleStartEvaluation}
          disabled={!selectedAgent}
          className={`flex items-center gap-2 rounded-[4px] px-6 py-2.5 text-sm font-bold transition-colors ${
            selectedAgent
              ? 'bg-[var(--primary)] text-white hover:bg-[var(--brand-primary-hover)]'
              : 'cursor-not-allowed bg-[var(--surface-container)] text-[var(--outline)]'
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
          <div className="w-full max-w-lg rounded-[8px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--outline-variant)] p-6">
              <h3 className="font-display text-lg font-bold text-[var(--on-surface)]">
                Select Agent
              </h3>
              <button
                type="button"
                onClick={() => setShowAgentSelector(false)}
                className="rounded-[4px] text-[var(--outline)] transition-colors hover:text-[var(--on-surface-variant)]"
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
                  className={`flex w-full items-center gap-4 rounded-[4px] border-2 p-4 text-left transition-colors ${
                    selectedAgentId === agent.id
                      ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                      : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
                  }`}
                >
                  <div className="flex size-12 items-center justify-center rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-2xl">
                    {agent.emoji}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display text-sm font-bold text-[var(--on-surface)]">
                      {agent.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-xs font-medium ${
                          agent.status === 'Active'
                            ? 'bg-[var(--success)]/10 text-[var(--success-foreground)]'
                            : 'bg-[var(--error)]/10 text-[var(--error-foreground)]'
                        }`}
                      >
                        {agent.status}
                      </span>
                      <span className="font-mono text-xs text-[var(--on-surface-variant)]">
                        Accuracy: {agent.accuracy}%
                      </span>
                    </div>
                  </div>
                  {selectedAgentId === agent.id && (
                    <span className="material-symbols-outlined text-[var(--primary)]">
                      check_circle
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end rounded-b-[8px] border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6">
              <button
                type="button"
                onClick={() => setShowAgentSelector(false)}
                className="rounded-[4px] px-4 py-2 text-sm font-medium text-[var(--on-surface-variant)] transition-colors hover:text-[var(--on-surface)]"
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
            <div className="size-8 animate-spin rounded-[4px] border-2 border-[var(--surface-container)] border-t-[var(--primary)]"></div>
          </div>
        }
      >
        <ConfigureEvaluationContent />
      </Suspense>
    </ErrorBoundary>
  );
}
