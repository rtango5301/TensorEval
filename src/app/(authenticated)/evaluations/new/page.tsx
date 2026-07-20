'use client';

import { useState, useEffect, useCallback, Suspense, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast-context';
import {
  MCPMarketplaceModal,
  MCP_SERVERS as MARKETPLACE_SERVERS,
} from '@/components/ui/mcp-marketplace-modal';
import { TestConnectionButton } from '@/components/ui/test-connection-button';

import { isValidExternalUrl } from '@/lib/validation/url';
import { useDatasets } from '@/hooks/use-datasets';
import { useCreateEvaluation } from '@/hooks/use-evaluations';
import { useUsageQuota } from '@/hooks/use-usage-quota';
import { UsageQuotaBanner } from '@/components/ui/usage-quota-banner';
import type { CreateEvaluationRequest, MCPServer } from '@/lib/api/types';

// Types
type WizardStep = 'agent' | 'dataset' | 'review';

interface CustomMCPServer {
  name: string;
  description: string;
  url: string;
}

interface AgentConfigState {
  evaluationName: string;
  name: string;
  model: string;
  apiKey: string;
  systemPrompt: string;
  description: string;
  agentUrl: string;
  customMcp: CustomMCPServer;
}

interface DatasetSelection {
  type: 'existing' | 'new';
  existingId?: string;
  existingName?: string;
}

function WizardStepIndicator({ currentStep }: { currentStep: WizardStep }) {
  const steps: { key: WizardStep; label: string; icon: string }[] = [
    { key: 'agent', label: 'Configure Agent', icon: 'smart_toy' },
    { key: 'dataset', label: 'Select Dataset', icon: 'folder_open' },
    { key: 'review', label: 'Review & Start', icon: 'play_circle' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div
            className={cn(
              'flex items-center gap-2 rounded-[4px] px-4 py-2 transition-colors',
              index === currentIndex
                ? 'bg-[var(--primary)] text-white'
                : index < currentIndex
                  ? 'bg-[var(--success)]/10 text-[var(--success-foreground)]'
                  : 'bg-[var(--surface-container-low)] text-[var(--outline)]'
            )}
          >
            <span className="material-symbols-outlined text-lg">
              {index < currentIndex ? 'check_circle' : step.icon}
            </span>
            <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-8 h-0.5 mx-2',
                index < currentIndex ? 'bg-[var(--success)]' : 'bg-[var(--surface-container)]'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Loading skeleton for datasets
function DatasetsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[8px] border border-[var(--outline-variant)] bg-white p-4"
        >
          <div className="mb-3 h-10 w-10 rounded-[8px] bg-[var(--surface-container)]" />
          <div className="mb-2 h-4 w-32 rounded-[4px] bg-[var(--surface-container)]" />
          <div className="h-3 w-24 rounded-[4px] bg-[var(--surface-container)]" />
        </div>
      ))}
    </div>
  );
}

function getAgentErrorMessage(status: string, serverMessage?: string): string {
  switch (status) {
    case 'auth_failed':
      return serverMessage || 'Authentication failed. Please check your API key.';
    case 'bad_request':
      return serverMessage || 'Bad request. Please check your agent configuration.';
    case 'rate_limited':
      return serverMessage || 'Rate limited. Please check your API quota and usage limits.';
    case 'reachable_not_agent':
      return 'URL is reachable but did not return a valid agent response.';
    case 'not_agent_url':
      return 'URL does not appear to be an API endpoint. Agent URLs should return JSON responses.';
    case 'server_error':
      return serverMessage || 'Server error. The agent endpoint returned a 5xx error.';
    case 'timeout':
      return 'Request timed out. The agent may be slow or unreachable.';
    case 'ssrf_blocked':
    case 'invalid_url':
      return 'Invalid URL. Must be a valid external HTTP(S) URL.';
    case 'unreachable':
    default:
      return serverMessage || 'Unable to reach agent. Please check the URL and try again.';
  }
}

function NewEvaluationWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const stepParam = searchParams.get('step') as WizardStep | null;
  const preselectedDataset = searchParams.get('dataset');

  // Fetch datasets from API
  const { datasets, isLoading: isDatasetsLoading, error: datasetsError } = useDatasets();
  const { createEvaluation, isCreating, error: createError } = useCreateEvaluation();
  const { quota, canCreateEvaluation, refetch: refetchQuota } = useUsageQuota();

  const [currentStep, setCurrentStep] = useState<WizardStep>(stepParam || 'agent');

  // Agent config state
  const [agentConfig, setAgentConfig] = useState<AgentConfigState>({
    evaluationName: '',
    name: '',
    model: '',
    apiKey: '',
    systemPrompt: '',
    description: '',
    agentUrl: '',
    customMcp: { name: '', description: '', url: '' },
  });

  // MCP Server selection state
  const [selectedMCPServers, setSelectedMCPServers] = useState<string[]>([]);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);

  // Inline title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Agent URL verification state — tracks backend test-connection result
  const [agentUrlVerified, setAgentUrlVerified] = useState(false);
  const [isVerifyingAgent, setIsVerifyingAgent] = useState(false);
  const [agentVerifyError, setAgentVerifyError] = useState<string | null>(null);
  const handleAgentUrlTestResult = useCallback(
    (status: 'idle' | 'loading' | 'success' | 'error') => {
      setAgentUrlVerified(status === 'success');
    },
    []
  );

  // Reset verified state and clear verify error when config fields change
  useEffect(() => {
    setAgentUrlVerified(false);
    setAgentVerifyError(null);
  }, [agentConfig.agentUrl, agentConfig.model, agentConfig.apiKey, agentConfig.systemPrompt]);

  // Dataset selection state
  const [datasetSelection, setDatasetSelection] = useState<DatasetSelection>({
    type: 'existing',
    existingId: preselectedDataset || undefined,
    existingName: undefined,
  });

  // Filter to only show completed datasets
  const readyDatasets = useMemo(() => {
    return datasets.filter((d) => d.status === 'completed');
  }, [datasets]);

  // Update dataset name when preselected or datasets load
  useEffect(() => {
    if (preselectedDataset && readyDatasets.length > 0) {
      const dataset = readyDatasets.find((d) => d.id === preselectedDataset);
      if (dataset) {
        setDatasetSelection({
          type: 'existing',
          existingId: dataset.id,
          existingName: dataset.name,
        });
      }
    }
  }, [preselectedDataset, readyDatasets]);

  // Update URL when step changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', currentStep);
    window.history.replaceState({}, '', url.toString());
  }, [currentStep]);

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const canProceedFromAgent =
    agentConfig.evaluationName &&
    agentConfig.name &&
    agentConfig.agentUrl &&
    isValidExternalUrl(agentConfig.agentUrl);
  const canProceedFromDataset = datasetSelection.type === 'new' || datasetSelection.existingId;

  const handleNext = async () => {
    if (currentStep === 'agent' && canProceedFromAgent) {
      // Skip verification if already verified via Test Connection button
      if (agentUrlVerified) {
        setCurrentStep('dataset');
        return;
      }

      setIsVerifyingAgent(true);
      setAgentVerifyError(null);

      try {
        const response = await fetch('/api/test-agent-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: agentConfig.agentUrl,
            model: agentConfig.model || undefined,
            apiKey: agentConfig.apiKey || undefined,
            systemPrompt: agentConfig.systemPrompt || undefined,
          }),
        });

        const data = await response.json();

        if (data.status === 'agent_valid') {
          setAgentUrlVerified(true);
          setCurrentStep('dataset');
        } else {
          setAgentVerifyError(getAgentErrorMessage(data.status, data.errorMessage));
        }
      } catch {
        setAgentVerifyError('Unable to verify agent. Please check your connection and try again.');
      } finally {
        setIsVerifyingAgent(false);
      }
    } else if (currentStep === 'dataset' && canProceedFromDataset) {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'dataset') {
      setCurrentStep('agent');
    } else if (currentStep === 'review') {
      setCurrentStep('dataset');
    }
  };

  const handleStartEvaluation = async () => {
    if (!canCreateEvaluation) {
      showToast(
        'Evaluation limit reached for this billing period. Please wait until your quota resets.',
        'error'
      );
      refetchQuota();
      return;
    }

    if (!datasetSelection.existingId) {
      showToast('Please select a dataset', 'error');
      return;
    }

    if (agentConfig.agentUrl && !isValidExternalUrl(agentConfig.agentUrl)) {
      showToast('Agent URL must be a valid external HTTP(S) URL', 'error');
      return;
    }

    if (agentConfig.apiKey && agentConfig.apiKey.length > 256) {
      showToast('API key exceeds maximum length of 256 characters', 'error');
      return;
    }

    // Build MCP servers array
    const mcpServers: MCPServer[] = [];

    // Add selected built-in servers
    selectedMCPServers.forEach((serverId) => {
      const server = MARKETPLACE_SERVERS.find((s) => s.id === serverId);
      if (server) {
        mcpServers.push({
          type: 'built_in',
          id: server.id,
          name: server.name,
        });
      }
    });

    // Add custom MCP server if provided
    if (agentConfig.customMcp.name && agentConfig.customMcp.url) {
      mcpServers.push({
        type: 'custom',
        id: agentConfig.customMcp.name.toLowerCase().replace(/\s+/g, '-'),
        name: agentConfig.customMcp.name,
        url: agentConfig.customMcp.url,
        description: agentConfig.customMcp.description || undefined,
      });
    }

    const request: CreateEvaluationRequest = {
      name: agentConfig.evaluationName,
      description: agentConfig.description || undefined,
      dataset_id: datasetSelection.existingId,
      agent_config: {
        name: agentConfig.name,
        url: agentConfig.agentUrl,
        model: agentConfig.model || undefined,
        api_key: agentConfig.apiKey || undefined,
        system_prompt: agentConfig.systemPrompt || undefined,
        description: agentConfig.description || undefined,
        mcp_servers: mcpServers.length > 0 ? mcpServers : undefined,
      },
    };

    const evaluation = await createEvaluation(request);
    if (evaluation) {
      showToast('Evaluation started successfully', 'success');
      router.push(`/evaluations/${evaluation.id}`);
    } else if (createError?.isRateLimited) {
      showToast(
        'Evaluation limit reached for this billing period. Please wait until your quota resets.',
        'error'
      );
      refetchQuota();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
        <Link href="/evaluations" className="transition-colors hover:text-[var(--primary)]">
          Evaluations
        </Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="font-medium text-[var(--on-surface)]">New Evaluation</span>
      </div>

      {/* Usage Quota Banner */}
      {quota && (
        <UsageQuotaBanner
          used={quota.evaluations_used}
          limit={quota.evaluations_limit}
          resourceName="evaluations"
          periodEnd={quota.period_end}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={agentConfig.evaluationName}
              onChange={(e) => setAgentConfig({ ...agentConfig, evaluationName: e.target.value })}
              onBlur={() => {
                setIsEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  setIsEditingTitle(false);
                }
              }}
              placeholder="Eval-123"
              className="-mx-3 -my-1 w-full max-w-md rounded-[4px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-1 font-display text-3xl font-bold tracking-tight text-[var(--on-surface)] outline-none transition-colors placeholder:font-normal placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--brand-highlight)]/30"
              aria-label="Evaluation name"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group -mx-3 -my-1 flex items-center gap-2 rounded-[4px] px-3 py-1 text-left transition-colors hover:bg-[var(--surface-container-low)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2"
              aria-label="Edit evaluation name"
            >
              <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--on-surface)]">
                {agentConfig.evaluationName || (
                  <span className="font-normal text-[var(--outline)]">Eval-123</span>
                )}
              </h1>
              <span className="material-symbols-outlined text-xl text-[var(--outline)] opacity-0 transition-all group-hover:text-[var(--primary)] group-hover:opacity-100">
                edit
              </span>
            </button>
          )}
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
            Configure your agent and select a dataset to evaluate.
          </p>
        </div>
        <WizardStepIndicator currentStep={currentStep} />
      </div>

      {/* API Error Banner */}
      {createError && (
        <div className="flex items-center gap-3 rounded-[8px] border border-[var(--error)]/20 bg-[var(--error)]/10 p-4">
          <span className="material-symbols-outlined text-[var(--error)]">error</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--error-foreground)]">
              Failed to create evaluation
            </p>
            <p className="text-sm text-[var(--error-foreground)]">{createError.message}</p>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white">
        {/* Step 1: Configure Agent */}
        {currentStep === 'agent' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-[8px] bg-[var(--surface-container-low)]">
                <span className="material-symbols-outlined text-[var(--primary)]">smart_toy</span>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--on-surface)]">
                  Configure Agent
                </h2>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Set up the agent you want to evaluate
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Evaluation Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                  Evaluation Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  value={agentConfig.evaluationName}
                  onChange={(e) =>
                    setAgentConfig({ ...agentConfig, evaluationName: e.target.value })
                  }
                  placeholder="e.g., Support Bot v2.4 - Safety Test"
                  className="w-full rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
              </div>

              {/* Agent Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                  Agent Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  value={agentConfig.name}
                  onChange={(e) => setAgentConfig({ ...agentConfig, name: e.target.value })}
                  placeholder="e.g., Support Bot v2.4"
                  className="w-full rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
              </div>

              {/* Model (Optional) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                  Model <span className="font-normal text-[var(--outline)]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={agentConfig.model}
                  onChange={(e) => setAgentConfig({ ...agentConfig, model: e.target.value })}
                  placeholder="e.g., gpt-4o, claude-4-sonnet"
                  className="w-full rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
              </div>

              {/* API Key (Optional) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                  API Key <span className="font-normal text-[var(--outline)]">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={agentConfig.apiKey}
                  onChange={(e) => setAgentConfig({ ...agentConfig, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
                <p className="mt-1.5 text-xs text-[var(--on-surface-variant)]">
                  Sent as Authorization: Bearer header
                </p>
              </div>

              {/* System Prompt (Optional) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                  System Prompt{' '}
                  <span className="font-normal text-[var(--outline)]">(Optional)</span>
                </label>
                <textarea
                  value={agentConfig.systemPrompt}
                  onChange={(e) => setAgentConfig({ ...agentConfig, systemPrompt: e.target.value })}
                  placeholder="You are a helpful assistant..."
                  rows={3}
                  className="w-full resize-none rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
              </div>

              {/* Agent Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                  Agent Description{' '}
                  <span className="font-normal text-[var(--outline)]">(Optional)</span>
                </label>
                <textarea
                  value={agentConfig.description}
                  onChange={(e) => setAgentConfig({ ...agentConfig, description: e.target.value })}
                  placeholder="Describe what this agent does, its expected behavior, and any specific capabilities..."
                  rows={3}
                  className="w-full resize-none rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
              </div>

              {/* Agent URL */}
              <div>
                <label
                  htmlFor="agent-url"
                  className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]"
                >
                  Agent URL <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  id="agent-url"
                  type="url"
                  value={agentConfig.agentUrl}
                  onChange={(e) => setAgentConfig({ ...agentConfig, agentUrl: e.target.value })}
                  placeholder="https://api.example.com/v1/chat/completions"
                  className="w-full rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
                <div className="mt-1.5 flex items-start gap-2 rounded-[4px] border border-[var(--primary)]/20 bg-[var(--primary)]/10 p-2.5">
                  <span className="material-symbols-outlined mt-0.5 text-sm text-[var(--primary)]">
                    info
                  </span>
                  <p className="text-xs text-[var(--on-surface-variant)]">
                    Agent URL should be an OpenAI-compatible chat completions endpoint (e.g.,{' '}
                    <code className="rounded-[4px] bg-[var(--surface-container)] px-1 py-0.5 text-[11px]">
                      https://api.openai.com/v1/chat/completions
                    </code>
                    )
                  </p>
                </div>
                <div className="mt-2">
                  <TestConnectionButton
                    url={agentConfig.agentUrl}
                    disabled={!agentConfig.agentUrl}
                    validateAgent={true}
                    successLabel="Agent Reachable"
                    onResult={handleAgentUrlTestResult}
                    agentConfig={{
                      model: agentConfig.model,
                      apiKey: agentConfig.apiKey,
                      systemPrompt: agentConfig.systemPrompt,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* MCP Server Selection */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-[var(--on-surface-variant)]">
                  MCP Servers
                </label>
                <span className="font-mono text-xs text-[var(--on-surface-variant)]">
                  {selectedMCPServers.length} of 3 selected
                </span>
              </div>

              {/* Browse MCP Servers Button */}
              <button
                type="button"
                onClick={() => setIsMcpModalOpen(true)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-[4px] px-4 py-2.5 text-sm font-medium transition-colors',
                  'border border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)] hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)] hover:text-[var(--primary)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2'
                )}
              >
                <span className="material-symbols-outlined text-lg">extension</span>
                Browse MCP Servers
              </button>

              {/* Selected Servers Chips */}
              {selectedMCPServers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedMCPServers.map((serverId) => {
                    const server = MARKETPLACE_SERVERS.find((s) => s.id === serverId);
                    if (!server) return null;
                    return (
                      <span
                        key={serverId}
                        className="inline-flex items-center gap-1.5 rounded-[4px] border-2 border-[var(--primary)] bg-[var(--surface-container-low)] px-3 py-1.5 text-sm font-medium text-[var(--primary)]"
                      >
                        <span className="material-symbols-outlined text-base">{server.icon}</span>
                        {server.name}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedMCPServers(
                              selectedMCPServers.filter((id) => id !== serverId)
                            )
                          }
                          className="ml-0.5 rounded-[4px] p-0.5 transition-colors hover:bg-[var(--surface-container)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)]"
                          aria-label={`Remove ${server.name}`}
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Custom MCP Server */}
              <div className="mt-4">
                <label className="mb-3 block text-sm font-semibold text-[var(--on-surface-variant)]">
                  Custom MCP Server{' '}
                  <span className="font-normal text-[var(--outline)]">(optional)</span>
                </label>
                <div className="space-y-4 rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
                  <div>
                    <label
                      htmlFor="custom-mcp-name"
                      className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]"
                    >
                      MCP Name
                    </label>
                    <input
                      id="custom-mcp-name"
                      type="text"
                      value={agentConfig.customMcp.name}
                      onChange={(e) =>
                        setAgentConfig({
                          ...agentConfig,
                          customMcp: { ...agentConfig.customMcp, name: e.target.value },
                        })
                      }
                      placeholder="e.g., Internal Pricing API"
                      className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="custom-mcp-description"
                      className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]"
                    >
                      MCP Description
                    </label>
                    <input
                      id="custom-mcp-description"
                      type="text"
                      value={agentConfig.customMcp.description}
                      onChange={(e) =>
                        setAgentConfig({
                          ...agentConfig,
                          customMcp: { ...agentConfig.customMcp, description: e.target.value },
                        })
                      }
                      placeholder="Describe what this MCP server does..."
                      className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="custom-mcp-url"
                      className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]"
                    >
                      MCP URL
                    </label>
                    <input
                      id="custom-mcp-url"
                      type="text"
                      value={agentConfig.customMcp.url}
                      onChange={(e) =>
                        setAgentConfig({
                          ...agentConfig,
                          customMcp: { ...agentConfig.customMcp, url: e.target.value },
                        })
                      }
                      placeholder="https://your-mcp-server.com"
                      className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                    />
                    <div className="mt-2">
                      <TestConnectionButton
                        url={agentConfig.customMcp.url}
                        disabled={!agentConfig.customMcp.url}
                        mode="mcp"
                        label="Test MCP Connection"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MCP Marketplace Modal */}
            <MCPMarketplaceModal
              isOpen={isMcpModalOpen}
              onClose={() => setIsMcpModalOpen(false)}
              selectedServers={selectedMCPServers}
              onSelectionChange={setSelectedMCPServers}
              maxSelections={3}
            />
          </div>
        )}

        {/* Step 2: Select Dataset */}
        {currentStep === 'dataset' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-[8px] bg-[var(--surface-container-low)]">
                <span className="material-symbols-outlined text-[var(--primary)]">folder_open</span>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--on-surface)]">
                  Select Dataset
                </h2>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Choose a completed dataset for evaluation
                </p>
              </div>
            </div>

            {/* Error state */}
            {datasetsError && (
              <div className="mb-6 rounded-[8px] border border-[var(--error)]/20 bg-[var(--error)]/10 p-4">
                <p className="text-sm text-[var(--error-foreground)]">{datasetsError.message}</p>
              </div>
            )}

            {/* Loading state */}
            {isDatasetsLoading ? (
              <DatasetsSkeleton />
            ) : (
              <>
                {/* Available Datasets Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-sm font-semibold text-[var(--on-surface)]">
                      Available Datasets
                    </h3>
                    <span className="font-mono text-xs text-[var(--on-surface-variant)]">
                      {readyDatasets.length} datasets ready
                    </span>
                  </div>

                  {readyDatasets.length === 0 ? (
                    <div className="rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] py-12 text-center">
                      <span className="material-symbols-outlined mb-2 text-4xl text-[var(--outline)]">
                        folder_off
                      </span>
                      <p className="text-[var(--on-surface-variant)]">
                        No completed datasets available
                      </p>
                      <Link
                        href="/datasets/new"
                        className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
                      >
                        Create a new dataset
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {readyDatasets.map((dataset) => {
                        const isSelected = datasetSelection.existingId === dataset.id;
                        return (
                          <button
                            key={dataset.id}
                            onClick={() =>
                              setDatasetSelection({
                                type: 'existing',
                                existingId: dataset.id,
                                existingName: dataset.name,
                              })
                            }
                            className={cn(
                              'relative flex flex-col gap-3 rounded-[8px] p-4 text-left transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2',
                              isSelected
                                ? 'border-2 border-[var(--primary)] bg-[var(--surface-container-low)]'
                                : 'border border-[var(--outline-variant)] bg-white hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)]'
                            )}
                          >
                            {/* Selection indicator */}
                            <div className="absolute right-3 top-3">
                              <div
                                className={cn(
                                  'flex size-5 items-center justify-center rounded-full border-2 transition-all',
                                  isSelected
                                    ? 'border-[var(--primary)] bg-[var(--primary)]'
                                    : 'border-[var(--outline)] bg-white'
                                )}
                              >
                                {isSelected && (
                                  <span className="material-symbols-outlined text-[14px] text-white">
                                    check
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Icon */}
                            <div className="flex size-10 items-center justify-center rounded-[8px] bg-[var(--surface-container-low)]">
                              <span
                                className={cn(
                                  'material-symbols-outlined text-2xl transition-colors',
                                  isSelected
                                    ? 'text-[var(--primary)]'
                                    : 'text-[var(--on-surface-variant)]'
                                )}
                              >
                                {dataset.source === 'uploaded' ? 'upload_file' : 'auto_awesome'}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-1 pr-6">
                              <h4 className="font-semibold text-[var(--on-surface)]">
                                {dataset.name}
                              </h4>
                              <p className="font-mono text-sm text-[var(--on-surface-variant)]">
                                {dataset.query_count} queries
                              </p>
                            </div>

                            {/* Type badge */}
                            <div className="mt-auto pt-1">
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-[4px] px-2.5 py-0.5 text-xs font-medium',
                                  dataset.source === 'uploaded'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-purple-100 text-purple-700'
                                )}
                              >
                                {dataset.source === 'uploaded' ? 'Uploaded' : 'Generated'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Small text link to create dataset */}
                  <p className="mt-6 text-sm text-[var(--on-surface-variant)]">
                    Need a new dataset?{' '}
                    <Link
                      href="/datasets/new"
                      className="font-medium text-[var(--primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                    >
                      Create one now
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Review & Start */}
        {currentStep === 'review' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-[8px] bg-[var(--success)]/10">
                <span className="material-symbols-outlined text-[var(--success)]">play_circle</span>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--on-surface)]">
                  Review & Start
                </h2>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Confirm your configuration before starting
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agent Summary */}
              <div className="rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--primary)]">
                      smart_toy
                    </span>
                    <span className="text-sm font-semibold text-[var(--on-surface)]">
                      Agent Configuration
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentStep('agent')}
                    className="text-xs font-medium text-[var(--primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Evaluation Name */}
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-[var(--outline)]">
                      Evaluation Name
                    </label>
                    <p className="mt-1 text-sm font-medium text-[var(--on-surface)]">
                      {agentConfig.evaluationName || (
                        <span className="italic text-[var(--outline)]">Untitled</span>
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--outline)]">
                        Agent Name
                      </label>
                      <p className="mt-1 text-sm font-medium text-[var(--on-surface)]">
                        {agentConfig.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--outline)]">
                        Model
                      </label>
                      <p className="mt-1 text-sm font-medium text-[var(--on-surface)]">
                        {agentConfig.model || 'Default'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-[var(--outline)]">
                      Agent URL
                    </label>
                    <p className="mt-1 break-all font-mono text-sm text-[var(--on-surface-variant)]">
                      {agentConfig.agentUrl}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-[var(--outline)]">
                      Description
                    </label>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--on-surface-variant)]">
                      {agentConfig.description}
                    </p>
                  </div>
                  {selectedMCPServers.length > 0 && (
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--outline)]">
                        MCP Servers
                      </label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {selectedMCPServers.map((serverId) => {
                          const server = MARKETPLACE_SERVERS.find((s) => s.id === serverId);
                          return (
                            <span
                              key={serverId}
                              className="inline-flex items-center gap-1 rounded-[4px] bg-[var(--surface-container)] px-2 py-0.5 text-xs font-medium text-[var(--primary)]"
                            >
                              <span className="material-symbols-outlined text-xs">
                                {server?.icon || 'extension'}
                              </span>
                              {server?.name || serverId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dataset Summary */}
              <div className="rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--primary)]">
                      folder_open
                    </span>
                    <span className="text-sm font-semibold text-[var(--on-surface)]">Dataset</span>
                  </div>
                  <button
                    onClick={() => setCurrentStep('dataset')}
                    className="text-xs font-medium text-[var(--primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--outline)]">
                        Name
                      </label>
                      <p className="mt-1 text-sm font-medium text-[var(--on-surface)]">
                        {datasetSelection.existingName || 'No dataset selected'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--outline)]">
                        ID
                      </label>
                      <p className="mt-1 font-mono text-sm text-[var(--on-surface-variant)]">
                        {datasetSelection.existingId?.slice(0, 8) || '--'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--outline)]">
                        Queries
                      </label>
                      <p className="mt-1 font-mono text-sm font-medium text-[var(--on-surface)]">
                        {datasetSelection.existingId
                          ? readyDatasets.find((d) => d.id === datasetSelection.existingId)
                              ?.query_count
                          : '--'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-[var(--outline)]">
                        Type
                      </label>
                      <p className="mt-1 text-sm font-medium text-[var(--on-surface)]">
                        {datasetSelection.existingId
                          ? readyDatasets.find((d) => d.id === datasetSelection.existingId)
                              ?.source === 'uploaded'
                            ? 'Uploaded'
                            : 'Generated'
                          : '--'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="mt-6 rounded-[8px] border border-[var(--warning)]/20 bg-[var(--warning)]/10 p-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined shrink-0 text-lg text-[var(--warning)]">
                  schedule
                </span>
                <div className="text-sm text-[var(--warning-foreground)]">
                  <p className="font-medium">Estimated Duration</p>
                  <p className="text-[var(--warning-foreground)]">
                    Based on{' '}
                    {readyDatasets.find((d) => d.id === datasetSelection.existingId)?.query_count ||
                      0}{' '}
                    queries, this evaluation should complete in approximately 5-10 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Verification Error Banner */}
        {agentVerifyError && currentStep === 'agent' && (
          <div className="mx-6 mb-0 mt-4 flex items-center gap-2 rounded-[8px] border border-[var(--error)]/20 bg-[var(--error)]/10 px-4 py-3">
            <span className="material-symbols-outlined text-lg text-[var(--error)]">error</span>
            <p className="text-sm text-[var(--error-foreground)]">{agentVerifyError}</p>
          </div>
        )}

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 'agent'}
            className={cn(
              'flex items-center gap-1.5 rounded-[4px] px-4 py-2 text-sm font-medium transition-colors',
              currentStep === 'agent'
                ? 'cursor-not-allowed text-[var(--outline)]'
                : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]'
            )}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>

          {currentStep === 'review' ? (
            <button
              onClick={handleStartEvaluation}
              disabled={!canProceedFromDataset || isCreating || !canCreateEvaluation}
              className="flex items-center gap-2 rounded-[4px] bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--surface-container)] disabled:text-[var(--outline)]"
            >
              {isCreating ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                  Starting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                  Start Evaluation
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 'agent' && !canProceedFromAgent) ||
                (currentStep === 'dataset' && !canProceedFromDataset) ||
                isVerifyingAgent
              }
              className={cn(
                'flex items-center gap-1.5 rounded-[4px] px-5 py-2.5 text-sm font-bold transition-colors',
                ((currentStep === 'agent' && canProceedFromAgent) ||
                  (currentStep === 'dataset' && canProceedFromDataset)) &&
                  !isVerifyingAgent
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--brand-primary-hover)]'
                  : 'cursor-not-allowed bg-[var(--surface-container)] text-[var(--outline)]'
              )}
            >
              {isVerifyingAgent ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                  Verifying...
                </>
              ) : (
                <>
                  Next
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewEvaluationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin">
            <span className="material-symbols-outlined text-3xl text-[var(--outline)]">
              refresh
            </span>
          </div>
        </div>
      }
    >
      <NewEvaluationWizardContent />
    </Suspense>
  );
}
