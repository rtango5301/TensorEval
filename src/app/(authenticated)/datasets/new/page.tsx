'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { OrDivider } from '@/components/ui/or-divider';
import { MCP_SERVERS } from '@/components/ui/mcp-marketplace-modal';
import { TestConnectionButton } from '@/components/ui/test-connection-button';
import { useCreateDataset } from '@/hooks/use-datasets';
import { uploadDatasetFile, StorageError } from '@/lib/supabase/storage';
import { useUsageQuota } from '@/hooks/use-usage-quota';
import { UsageQuotaBanner } from '@/components/ui/usage-quota-banner';
import type {
  CreateDatasetGeneratedRequest,
  CreateDatasetUploadedRequest,
  MCPServer,
} from '@/lib/api/types';

const MCPMarketplaceModal = dynamic(
  () => import('@/components/ui/mcp-marketplace-modal').then((mod) => mod.MCPMarketplaceModal),
  { ssr: false }
);

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

// Schema preview mock data (shown after file selection)
const schemaPreview = [
  { field: 'query', type: 'string', example: 'How do I reset my password?' },
  { field: 'category', type: 'string', example: 'account' },
];

export default function NewDatasetPage() {
  const router = useRouter();
  const { createDataset, isCreating, error: createError } = useCreateDataset();
  const { quota, canCreateDataset, refetch: refetchQuota } = useUsageQuota();

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadDatasetName, setUploadDatasetName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Generate state
  const [generateDatasetName, setGenerateDatasetName] = useState('');
  const [generateDatasetDescription, setGenerateDatasetDescription] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [queryCount, setQueryCount] = useState(10);
  const [queryCountInputValue, setQueryCountInputValue] = useState('10');
  const [sliderDisplayValue, setSliderDisplayValue] = useState(10);
  const snapBackTimer = useRef<NodeJS.Timeout | null>(null);
  const [showQueryCapMessage, setShowQueryCapMessage] = useState(false);

  // Sync slider display when queryCount changes
  useEffect(() => {
    if (queryCount <= 20) {
      setSliderDisplayValue(queryCount);
    }
  }, [queryCount]);

  // Cleanup snap-back timer on unmount
  useEffect(() => {
    return () => {
      if (snapBackTimer.current) clearTimeout(snapBackTimer.current);
    };
  }, []);

  // MCP state (UI only for now)
  const [selectedMCPServers, setSelectedMCPServers] = useState<string[]>([]);
  const [customMcpServer, setCustomMcpServer] = useState({
    name: '',
    description: '',
    url: '',
  });
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);

  // Helper to remove a selected MCP server
  const removeSelectedServer = (serverId: string) => {
    setSelectedMCPServers((prev) => prev.filter((id) => id !== serverId));
  };

  // Get server details by ID
  const getServerById = (serverId: string) => {
    return MCP_SERVERS.find((s) => s.id === serverId);
  };

  // Handle file drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setUploadError(null);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.csv') || file.name.endsWith('.json'))) {
        if (file.size > MAX_FILE_SIZE) {
          setUploadError('File size exceeds 3MB limit');
          return;
        }
        setUploadFile(file);
        if (!uploadDatasetName) {
          setUploadDatasetName(file.name.replace(/\.(csv|json)$/, ''));
        }
      } else {
        setUploadError('Please upload a CSV or JSON file');
      }
    },
    [uploadDatasetName]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        if (file.size > MAX_FILE_SIZE) {
          setUploadError('File size exceeds 3MB limit');
          return;
        }
        setUploadFile(file);
        if (!uploadDatasetName) {
          setUploadDatasetName(file.name.replace(/\.(csv|json)$/, ''));
        }
      } else {
        setUploadError('Please upload a CSV or JSON file');
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!canCreateDataset) {
      setUploadError(
        'Dataset limit reached for this billing period. Please wait until your quota resets.'
      );
      refetchQuota();
      return;
    }

    if (!uploadFile || !uploadDatasetName) return;

    setUploadError(null);

    try {
      // Upload file to Supabase Storage
      const sourceUrl = await uploadDatasetFile(uploadFile);

      // Create dataset with uploaded source
      const request: CreateDatasetUploadedRequest = {
        name: uploadDatasetName,
        description: uploadDescription || undefined,
        source: 'uploaded',
        source_url: sourceUrl,
      };

      const dataset = await createDataset(request);
      if (dataset) {
        router.push(`/datasets/${dataset.id}`);
      }
    } catch (err) {
      if (err instanceof StorageError) {
        setUploadError(err.message);
      } else {
        setUploadError('Failed to upload file. Please try again.');
      }
    }
  };

  const handleGenerateSubmit = async () => {
    if (!canCreateDataset) {
      setUploadError(
        'Dataset limit reached for this billing period. Please wait until your quota resets.'
      );
      refetchQuota();
      return;
    }

    if (!generateDatasetName || !agentName || !agentDescription) return;

    // Build MCP servers array
    const mcpServers: MCPServer[] = [];

    // Add selected built-in servers
    selectedMCPServers.forEach((serverId) => {
      const server = getServerById(serverId);
      if (server) {
        mcpServers.push({
          type: 'built_in',
          id: server.id,
          name: server.name,
        });
      }
    });

    // Add custom MCP server if provided
    if (customMcpServer.name && customMcpServer.url) {
      mcpServers.push({
        type: 'custom',
        id: customMcpServer.name.toLowerCase().replace(/\s+/g, '-'),
        name: customMcpServer.name,
        url: customMcpServer.url,
        description: customMcpServer.description || undefined,
      });
    }

    const request: CreateDatasetGeneratedRequest = {
      name: generateDatasetName,
      description: generateDatasetDescription || undefined,
      source: 'generated',
      agent_name: agentName,
      agent_description: agentDescription,
      mcp_servers: mcpServers.length > 0 ? mcpServers : undefined,
      query_count: queryCount,
    };

    const dataset = await createDataset(request);
    if (dataset) {
      // Redirect to dataset detail page for polling
      router.push(`/datasets/${dataset.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
        <Link href="/datasets" className="transition-colors hover:text-[var(--primary)]">
          Datasets
        </Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="font-medium text-[var(--on-surface)]">Create New</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--on-surface)]">
          Create New Dataset
        </h1>
        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
          Upload an existing dataset or generate one using AI.
        </p>
      </div>

      {/* Usage Quota Banner */}
      {quota && (
        <UsageQuotaBanner
          used={quota.datasets_used}
          limit={quota.datasets_limit}
          resourceName="datasets"
          periodEnd={quota.period_end}
        />
      )}

      {/* API Error Banner */}
      {createError && (
        <div className="flex items-center gap-3 rounded-[8px] border border-red-200 bg-red-50 p-4">
          <span className="material-symbols-outlined text-red-500">error</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Failed to create dataset</p>
            <p className="text-sm text-red-600">{createError.message}</p>
          </div>
        </div>
      )}

      {/* Stacked Panels with OrDivider */}
      <div className="flex flex-col gap-6">
        {/* Panel A: Upload Dataset */}
        <div className="overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
          <div className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-[8px] bg-blue-100">
                <span className="material-symbols-outlined text-blue-600">upload_file</span>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--on-surface)]">
                  Upload Dataset
                </h2>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Upload a CSV or JSON file
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Dataset Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                Dataset Name
              </label>
              <input
                type="text"
                value={uploadDatasetName}
                onChange={(e) => setUploadDatasetName(e.target.value)}
                placeholder="Enter dataset name..."
                className="w-full rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
              />
            </div>

            {/* Dataset Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                Description <span className="font-normal text-[var(--outline)]">(Optional)</span>
              </label>
              <textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Describe the purpose of this dataset..."
                rows={2}
                className="w-full resize-none rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
              />
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                'rounded-[8px] border-2 border-dashed p-8 text-center transition-colors',
                isDragging
                  ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                  : uploadFile
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
              )}
            >
              {uploadFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-[8px] bg-emerald-100">
                    <span className="material-symbols-outlined text-emerald-600 text-2xl">
                      check_circle
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--on-surface)]">
                      {uploadFile.name}
                    </p>
                    <p className="text-xs text-[var(--on-surface-variant)]">
                      {(uploadFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadFile(null)}
                    className="text-sm text-[var(--on-surface-variant)] transition-colors hover:text-red-600"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-[8px] bg-[var(--surface-container-low)]">
                    <span className="material-symbols-outlined text-2xl text-[var(--outline)]">
                      cloud_upload
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--on-surface-variant)]">
                      Drag and drop your file here
                    </p>
                    <p className="mt-1 text-xs text-[var(--on-surface-variant)]">or</p>
                  </div>
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-[var(--primary)] hover:underline">
                      Browse files
                    </span>
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-[var(--outline)]">Supports CSV and JSON files</p>
                </div>
              )}
            </div>

            {/* Upload Error */}
            {uploadError && (
              <div className="flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 p-3">
                <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}

            {/* Schema Preview */}
            {uploadFile && (
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--on-surface-variant)]">
                  Schema Preview
                </label>
                <div className="overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-[var(--on-surface-variant)]">
                          Field
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-[var(--on-surface-variant)]">
                          Type
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-[var(--on-surface-variant)]">
                          Example
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--outline-variant)] bg-white">
                      {schemaPreview.map((row) => (
                        <tr key={row.field}>
                          <td className="px-3 py-2 font-mono text-[var(--on-surface-variant)]">
                            {row.field}
                          </td>
                          <td className="px-3 py-2 text-[var(--on-surface-variant)]">{row.type}</td>
                          <td className="max-w-[150px] truncate px-3 py-2 text-[var(--on-surface-variant)]">
                            {row.example}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleUploadSubmit}
              disabled={!uploadFile || !uploadDatasetName || isCreating || !canCreateDataset}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-[4px] py-2.5 text-sm font-bold transition-colors',
                uploadFile && uploadDatasetName && !isCreating && canCreateDataset
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--brand-primary-hover)]'
                  : 'cursor-not-allowed bg-[var(--surface-container-low)] text-[var(--outline)]'
              )}
            >
              {isCreating ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">upload</span>
                  Upload Dataset
                </>
              )}
            </button>
          </div>
        </div>

        <OrDivider className="my-2" />

        {/* Panel B: Generate Dataset */}
        <div className="overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
          <div className="border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-[8px] bg-[var(--surface-container)]">
                <span className="material-symbols-outlined text-[var(--brand-secondary)]">
                  auto_awesome
                </span>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--on-surface)]">
                  Generate Dataset
                </h2>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Use AI to create test cases
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Dataset Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                Dataset Name
              </label>
              <input
                type="text"
                value={generateDatasetName}
                onChange={(e) => setGenerateDatasetName(e.target.value)}
                placeholder="e.g., Customer Support Test Cases"
                className="w-full rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
              />
            </div>

            {/* Dataset Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                Dataset Description{' '}
                <span className="font-normal text-[var(--outline)]">(Optional)</span>
              </label>
              <textarea
                value={generateDatasetDescription}
                onChange={(e) => setGenerateDatasetDescription(e.target.value)}
                placeholder="Describe the purpose of this dataset..."
                rows={2}
                className="w-full resize-none rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--outline-variant)] pt-2">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--on-surface-variant)]">
                Agent Information
              </p>
            </div>

            {/* Agent Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                Agent Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Customer Support Bot"
                className="w-full rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
              />
            </div>

            {/* Agent Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                Agent Description
              </label>
              <textarea
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Describe what the agent does, its capabilities, and expected behavior..."
                rows={4}
                className="w-full resize-none rounded-[4px] border border-[var(--outline-variant)] px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
              />
            </div>

            {/* MCP Server Marketplace */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                MCP Servers{' '}
                <span className="font-normal text-[var(--outline)]">(Optional, max 3)</span>
              </label>

              {/* Browse MCP Servers Button */}
              <button
                type="button"
                onClick={() => setIsMcpModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-[4px] border border-[var(--outline-variant)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--on-surface-variant)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)] focus:ring-offset-2"
              >
                <span className="material-symbols-outlined text-lg">storefront</span>
                Browse MCP Servers
                {selectedMCPServers.length > 0 && (
                  <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-[4px] bg-[var(--primary)] text-xs font-bold text-white">
                    {selectedMCPServers.length}
                  </span>
                )}
              </button>

              {/* Selected Servers Chips */}
              {selectedMCPServers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedMCPServers.map((serverId) => {
                    const server = getServerById(serverId);
                    if (!server) return null;
                    return (
                      <div
                        key={serverId}
                        className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--primary)]/20 bg-[var(--surface-container)] py-1.5 pl-2.5 pr-1.5 text-xs font-medium text-[var(--primary)]"
                      >
                        <span className="material-symbols-outlined text-sm">{server.icon}</span>
                        {server.name}
                        <button
                          type="button"
                          onClick={() => removeSelectedServer(serverId)}
                          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-[4px] transition-colors hover:bg-[var(--surface-container-high)]"
                          aria-label={`Remove ${server.name}`}
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="mt-1.5 text-xs text-[var(--on-surface-variant)]">
                Connect to MCP servers for context-aware test generation
              </p>
            </div>

            {/* MCP Marketplace Modal - lazy loaded for faster page navigation */}
            {isMcpModalOpen && (
              <MCPMarketplaceModal
                isOpen={isMcpModalOpen}
                onClose={() => setIsMcpModalOpen(false)}
                selectedServers={selectedMCPServers}
                onSelectionChange={setSelectedMCPServers}
                maxSelections={3}
              />
            )}

            {/* Custom MCP Server */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[var(--on-surface-variant)]">
                Custom MCP Server{' '}
                <span className="font-normal text-[var(--outline)]">(Optional)</span>
              </label>
              <div className="space-y-4 rounded-[8px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
                <div>
                  <label
                    htmlFor="dataset-custom-mcp-name"
                    className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]"
                  >
                    MCP Name
                  </label>
                  <input
                    id="dataset-custom-mcp-name"
                    type="text"
                    value={customMcpServer.name}
                    onChange={(e) =>
                      setCustomMcpServer({ ...customMcpServer, name: e.target.value })
                    }
                    placeholder="e.g., Internal Pricing API"
                    className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dataset-custom-mcp-description"
                    className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]"
                  >
                    MCP Description
                  </label>
                  <input
                    id="dataset-custom-mcp-description"
                    type="text"
                    value={customMcpServer.description}
                    onChange={(e) =>
                      setCustomMcpServer({ ...customMcpServer, description: e.target.value })
                    }
                    placeholder="Describe what this MCP server does..."
                    className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dataset-custom-mcp-url"
                    className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]"
                  >
                    MCP URL
                  </label>
                  <input
                    id="dataset-custom-mcp-url"
                    type="text"
                    value={customMcpServer.url}
                    onChange={(e) =>
                      setCustomMcpServer({ ...customMcpServer, url: e.target.value })
                    }
                    placeholder="https://your-mcp-server.com"
                    className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white px-3 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                  />
                  <div className="mt-2">
                    <TestConnectionButton
                      url={customMcpServer.url}
                      disabled={!customMcpServer.url}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Query Count */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--on-surface-variant)]">
                Number of Queries
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={3}
                  max={500}
                  step={1}
                  value={sliderDisplayValue}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    setSliderDisplayValue(raw);
                    setQueryCountInputValue(String(raw));
                    if (snapBackTimer.current) clearTimeout(snapBackTimer.current);

                    if (raw > 20) {
                      setShowQueryCapMessage(true);
                      setQueryCount(20);
                      snapBackTimer.current = setTimeout(() => {
                        setSliderDisplayValue(20);
                        setQueryCountInputValue('20');
                      }, 800);
                    } else {
                      setQueryCount(Math.max(3, raw));
                      setShowQueryCapMessage(false);
                    }
                  }}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-[4px] bg-[var(--surface-container)] accent-[var(--primary)]"
                  style={{ transition: 'all 0.3s ease' }}
                />
                <input
                  type="number"
                  min={3}
                  max={500}
                  value={queryCountInputValue}
                  onChange={(e) => {
                    setQueryCountInputValue(e.target.value);
                  }}
                  onBlur={() => {
                    const raw = Number(queryCountInputValue) || 3;
                    if (raw > 20) {
                      setQueryCount(20);
                      setQueryCountInputValue('20');
                      setShowQueryCapMessage(true);
                    } else {
                      const clamped = Math.max(3, raw);
                      setQueryCount(clamped);
                      setQueryCountInputValue(String(clamped));
                      setShowQueryCapMessage(false);
                    }
                  }}
                  className="w-20 rounded-[4px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2 text-center font-mono text-sm font-bold text-[var(--on-surface)] transition-colors focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
                />
              </div>
              {showQueryCapMessage ? (
                <p className="text-xs text-amber-600 mt-1.5">
                  Free plan is limited to 20 queries per dataset. Upgrade for more.
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-[var(--on-surface-variant)]">
                  3–20 queries per dataset on the free plan
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="rounded-[8px] border border-[var(--primary)]/20 bg-[var(--surface-container-low)] p-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined shrink-0 text-lg text-[var(--primary)]">
                  info
                </span>
                <div className="text-sm text-[var(--on-surface)]">
                  <p className="font-medium mb-1">AI-Powered Generation</p>
                  <p className="text-[var(--on-surface-variant)]">
                    We&apos;ll analyze your agent description and generate diverse, realistic test
                    cases including edge cases and adversarial prompts.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerateSubmit}
              disabled={
                !generateDatasetName ||
                !agentName ||
                !agentDescription ||
                isCreating ||
                !canCreateDataset
              }
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-[4px] py-2.5 text-sm font-bold transition-colors',
                generateDatasetName &&
                  agentName &&
                  agentDescription &&
                  !isCreating &&
                  canCreateDataset
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--brand-primary-hover)]'
                  : 'cursor-not-allowed bg-[var(--surface-container-low)] text-[var(--outline)]'
              )}
            >
              {isCreating ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  Generate Dataset
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
