'use client';

import { useEffect, useRef } from 'react';
import { useTestUrl } from '@/hooks/use-test-url';
import { useTestMcpUrl } from '@/hooks/use-test-mcp-url';
import { cn } from '@/lib/utils';

interface TestConnectionButtonProps {
  url: string;
  disabled?: boolean;
  label?: string;
  successLabel?: string;
  validateAgent?: boolean;
  mode?: 'reachability' | 'mcp';
  className?: string;
  onResult?: (status: 'idle' | 'loading' | 'success' | 'error') => void;
  agentConfig?: { model?: string; apiKey?: string; systemPrompt?: string };
}

/**
 * Test Connection Button
 * Displays URL reachability or MCP validation status with visual feedback and inline retry.
 * Uses `mode` prop to select between reachability check and MCP protocol validation.
 */
export function TestConnectionButton(props: TestConnectionButtonProps) {
  const { mode = 'reachability' } = props;
  if (mode === 'mcp') {
    return <McpTestConnectionButton {...props} />;
  }
  return <ReachabilityTestConnectionButton {...props} />;
}

// ─── Shared UI helpers ──────────────────────────────────────────────────────

function IdleButton({
  onClick,
  disabled,
  label,
  className,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
        'border border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)]',
        'hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)] hover:text-[var(--primary)]',
        'active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--outline-variant)] disabled:hover:bg-white disabled:hover:text-[var(--on-surface-variant)] disabled:active:scale-100',
        className
      )}
    >
      <span className="material-symbols-outlined text-sm">wifi</span>
      {label}
    </button>
  );
}

function LoadingBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md',
        'border border-[var(--primary)]/30 bg-[var(--surface-container-low)] text-[var(--primary)]',
        className
      )}
    >
      <span className="flex items-center gap-0.5">
        <span className="h-1 w-1 rounded-full bg-[var(--primary)] animate-[pulse-dot_1.4s_ease-in-out_infinite]" />
        <span className="h-1 w-1 rounded-full bg-[var(--primary)] animate-[pulse-dot_1.4s_ease-in-out_0.2s_infinite]" />
        <span className="h-1 w-1 rounded-full bg-[var(--primary)] animate-[pulse-dot_1.4s_ease-in-out_0.4s_infinite]" />
      </span>
      Testing connection...
    </span>
  );
}

function RetryButton({
  onClick,
  disabled,
  showLabel,
}: {
  onClick: () => void;
  disabled?: boolean;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all duration-200',
        'border border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)]',
        'hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)] hover:text-[var(--primary)]',
        'active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-1'
      )}
      title="Retry connection test"
    >
      <span className="material-symbols-outlined text-sm">refresh</span>
      {showLabel && 'Retry'}
    </button>
  );
}

// ─── Reachability mode (existing behavior) ──────────────────────────────────

function ReachabilityTestConnectionButton({
  url,
  disabled = false,
  label = 'Test Connection',
  successLabel = 'Reachable',
  validateAgent = false,
  className,
  onResult,
  agentConfig,
}: TestConnectionButtonProps) {
  const { isLoading, result, testUrl, reset } = useTestUrl();
  const prevUrlRef = useRef(url);
  const prevAgentConfigRef = useRef(agentConfig);

  // Reset when URL changes
  useEffect(() => {
    if (url !== prevUrlRef.current) {
      prevUrlRef.current = url;
      if (result.status !== 'idle') reset();
    }
  }, [url, result.status, reset]);

  // Reset when agentConfig fields change (user corrected API key, added model, etc.)
  useEffect(() => {
    const prev = prevAgentConfigRef.current;
    if (
      prev?.model !== agentConfig?.model ||
      prev?.apiKey !== agentConfig?.apiKey ||
      prev?.systemPrompt !== agentConfig?.systemPrompt
    ) {
      prevAgentConfigRef.current = agentConfig;
      if (result.status !== 'idle') reset();
    }
  }, [agentConfig?.model, agentConfig?.apiKey, agentConfig?.systemPrompt, result.status, reset]);

  // Notify parent of result changes
  useEffect(() => {
    onResult?.(result.status);
  }, [result.status, onResult]);

  const trimmedUrl = url?.trim() || '';
  const isDisabled = disabled || !trimmedUrl;
  const testOptions = validateAgent ? { validateAgent: true, ...agentConfig } : undefined;

  const handleClick = async () => {
    if (!trimmedUrl || isLoading) return;
    await testUrl(trimmedUrl, testOptions);
  };

  const handleRetry = async () => {
    reset();
    if (!trimmedUrl || isLoading) return;
    await new Promise((r) => setTimeout(r, 100));
    await testUrl(trimmedUrl, testOptions);
  };

  if (result.status === 'idle') {
    return (
      <IdleButton onClick={handleClick} disabled={isDisabled} label={label} className={className} />
    );
  }

  if (result.status === 'loading') {
    return <LoadingBadge className={className} />;
  }

  if (result.status === 'success') {
    const replySnippet = result.agentReply ? ` · '${result.agentReply.slice(0, 30).trim()}'` : '';
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md',
            'border border-emerald-200 bg-emerald-50 text-emerald-700'
          )}
        >
          <span className="material-symbols-outlined text-sm">check_circle</span>
          {successLabel}
          {replySnippet}
          {result.responseTime !== undefined && (
            <span className="text-emerald-500 font-normal">({result.responseTime}ms)</span>
          )}
        </span>
        <RetryButton onClick={handleRetry} />
      </span>
    );
  }

  // Amber warning states — URL confirmed reachable but config incomplete
  if (
    result.errorCode === 'AUTH_FAILED' ||
    result.errorCode === 'BAD_REQUEST' ||
    result.errorCode === 'RATE_LIMITED'
  ) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md',
            'border border-amber-200 bg-amber-50 text-amber-700'
          )}
          title={result.errorMessage}
        >
          <span className="material-symbols-outlined text-sm">warning</span>
          Reachable &middot; {result.errorMessage}
        </span>
        <RetryButton onClick={handleRetry} disabled={isLoading} showLabel />
      </span>
    );
  }

  // Error state (red)
  const getErrorLabel = () => {
    switch (result.errorCode) {
      case 'INVALID_URL':
        return 'Invalid URL';
      case 'SERVER_ERROR':
        return 'Server Error';
      case 'TIMEOUT':
        return 'Timed Out';
      case 'NOT_AGENT_URL':
        return 'Not an Agent URL';
      default:
        return 'Unreachable';
    }
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md',
          'border border-red-200 bg-red-50 text-red-700'
        )}
        title={result.errorMessage}
      >
        <span className="material-symbols-outlined text-sm">cancel</span>
        {getErrorLabel()}
      </span>
      <RetryButton onClick={handleRetry} disabled={isLoading} showLabel />
    </span>
  );
}

// ─── MCP mode ───────────────────────────────────────────────────────────────

function McpTestConnectionButton({
  url,
  disabled = false,
  label = 'Test MCP Connection',
  className,
}: TestConnectionButtonProps) {
  const { isLoading, result, testUrl, reset } = useTestMcpUrl();
  const prevUrlRef = useRef(url);

  // Reset when URL changes
  useEffect(() => {
    if (url !== prevUrlRef.current) {
      prevUrlRef.current = url;
      if (result.status !== 'idle') reset();
    }
  }, [url, result.status, reset]);

  const trimmedUrl = url?.trim() || '';
  const isDisabled = disabled || !trimmedUrl;

  const handleClick = async () => {
    if (!trimmedUrl || isLoading) return;
    await testUrl(trimmedUrl);
  };

  const handleRetry = async () => {
    reset();
    if (!trimmedUrl || isLoading) return;
    await new Promise((r) => setTimeout(r, 100));
    await testUrl(trimmedUrl);
  };

  // Idle
  if (result.status === 'idle') {
    return (
      <IdleButton onClick={handleClick} disabled={isDisabled} label={label} className={className} />
    );
  }

  // Loading
  if (result.status === 'loading') {
    return <LoadingBadge className={className} />;
  }

  // MCP Valid (green)
  if (result.status === 'mcp_valid') {
    const serverName = result.serverInfo?.name || 'MCP Server';
    const tools = result.tools;
    const toolCount = tools?.length ?? 0;
    const maxChips = 10;
    const visibleTools = tools?.slice(0, maxChips);
    const overflowCount = toolCount > maxChips ? toolCount - maxChips : 0;

    return (
      <div className={cn('space-y-2 text-xs font-medium', className)}>
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md',
              'border border-emerald-200 bg-emerald-50 text-emerald-700'
            )}
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            MCP Server &middot; {serverName}
            {toolCount > 0 && (
              <span className="text-emerald-600">
                &middot; {toolCount} tool{toolCount !== 1 ? 's' : ''}
              </span>
            )}
            {result.responseTime !== undefined && (
              <span className="text-emerald-500 font-normal">{result.responseTime}ms</span>
            )}
          </span>
          <RetryButton onClick={handleRetry} />
        </span>
        {visibleTools && visibleTools.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleTools.map((tool) => (
              <span
                key={tool.name}
                title={tool.description}
                className="inline-flex items-center gap-1 rounded border border-[var(--outline-variant)] bg-white px-2 py-0.5 text-[11px] text-[var(--on-surface-variant)]"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                  build
                </span>
                {tool.name}
              </span>
            ))}
            {overflowCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 text-[11px] text-[var(--outline)]">
                +{overflowCount} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Reachable but not MCP (amber)
  if (result.status === 'reachable_not_mcp') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md',
            'border border-amber-200 bg-amber-50 text-amber-700'
          )}
          title={result.errorMessage}
        >
          <span className="material-symbols-outlined text-sm">warning</span>
          Not MCP Server
        </span>
        <RetryButton onClick={handleRetry} showLabel />
      </span>
    );
  }

  // Error / unreachable states (red)
  const getMcpErrorLabel = () => {
    switch (result.errorCode) {
      case 'INVALID_URL':
        return 'Invalid URL';
      case 'TIMEOUT':
        return 'Timed Out';
      case 'SSRF_BLOCKED':
        return 'Blocked URL';
      case 'RATE_LIMITED':
        return 'Rate Limited';
      case 'SERVER_ERROR':
        return 'Server Error';
      case 'NOT_MCP_SERVER':
        return 'Not MCP Server';
      default:
        return 'Unreachable';
    }
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md',
          'border border-red-200 bg-red-50 text-red-700'
        )}
        title={result.errorMessage}
      >
        <span className="material-symbols-outlined text-sm">cancel</span>
        {getMcpErrorLabel()}
      </span>
      <RetryButton onClick={handleRetry} disabled={isLoading} showLabel />
    </span>
  );
}
