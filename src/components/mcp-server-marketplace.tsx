'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

type MCPServerCategory = 'all' | 'file-system' | 'database' | 'api' | 'custom';

interface MCPServer {
  id: string;
  name: string;
  description: string;
  category: Exclude<MCPServerCategory, 'all'>;
  icon: string; // Material Symbol name
}

interface MCPServerMarketplaceProps {
  selectedServers: string[];
  onSelectionChange: (servers: string[]) => void;
  maxSelections?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_SERVERS: MCPServer[] = [
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Read, write, and manage local files and directories with secure sandboxing.',
    category: 'file-system',
    icon: 'folder_open',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL databases for queries, migrations, and data operations.',
    category: 'database',
    icon: 'database',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Full Supabase integration with auth, storage, and real-time database access.',
    category: 'database',
    icon: 'bolt',
  },
  {
    id: 'github-api',
    name: 'GitHub API',
    description: 'Interact with repositories, issues, pull requests, and GitHub Actions.',
    category: 'api',
    icon: 'code',
  },
  {
    id: 'slack-api',
    name: 'Slack API',
    description: 'Send messages, manage channels, and integrate with Slack workspaces.',
    category: 'api',
    icon: 'chat',
  },
  {
    id: 'custom-http',
    name: 'Custom HTTP',
    description: 'Define custom HTTP endpoints with configurable authentication and headers.',
    category: 'custom',
    icon: 'http',
  },
];

const CATEGORY_LABELS: Record<MCPServerCategory, string> = {
  all: 'All',
  'file-system': 'File System',
  database: 'Database',
  api: 'API',
  custom: 'Custom',
};

const CATEGORY_ORDER: MCPServerCategory[] = ['all', 'file-system', 'database', 'api', 'custom'];

// ============================================================================
// Helper Components
// ============================================================================

interface CategoryChipProps {
  category: MCPServerCategory;
  isActive: boolean;
  onClick: () => void;
}

function CategoryChip({ category, isActive, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-[4px] px-4 py-1.5 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2',
        isActive
          ? 'bg-[var(--primary)] text-white'
          : 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]'
      )}
    >
      {CATEGORY_LABELS[category]}
    </button>
  );
}

interface ServerCardProps {
  server: MCPServer;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

function ServerCard({ server, isSelected, isDisabled, onToggle }: ServerCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled && !isSelected}
      aria-pressed={isSelected}
      className={cn(
        'relative flex flex-col gap-3 rounded-xl p-4 text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2',
        isSelected
          ? 'border-2 border-[var(--primary)] bg-[var(--surface-container-low)]'
          : 'border border-[var(--outline-variant)] bg-white hover:border-[var(--primary)]/50 hover:bg-[var(--surface-container-low)]',
        isDisabled && !isSelected && 'cursor-not-allowed opacity-50'
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
            <span className="material-symbols-outlined text-[14px] text-white">check</span>
          )}
        </div>
      </div>

      {/* Icon */}
      <div className="flex size-10 items-center justify-center rounded-[4px] bg-[var(--surface-container-low)]">
        <span
          className={cn(
            'material-symbols-outlined text-2xl transition-colors',
            isSelected ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'
          )}
        >
          {server.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 pr-6">
        <h3 className="font-semibold text-[var(--on-surface)]">{server.name}</h3>
        <p className="text-sm leading-relaxed text-[var(--on-surface-variant)]">
          {server.description}
        </p>
      </div>

      {/* Category badge */}
      <div className="mt-auto pt-1">
        <span
          className={cn(
            'inline-flex items-center rounded-[4px] px-2.5 py-0.5 text-xs font-medium',
            server.category === 'file-system' && 'bg-amber-100 text-amber-700',
            server.category === 'database' && 'bg-emerald-100 text-emerald-700',
            server.category === 'api' && 'bg-blue-100 text-blue-700',
            server.category === 'custom' && 'bg-purple-100 text-purple-700'
          )}
        >
          {CATEGORY_LABELS[server.category]}
        </span>
      </div>
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function MCPServerMarketplace({
  selectedServers,
  onSelectionChange,
  maxSelections,
}: MCPServerMarketplaceProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<MCPServerCategory>('all');

  // Filter servers based on search and category
  const filteredServers = React.useMemo(() => {
    return MOCK_SERVERS.filter((server) => {
      const matchesSearch =
        searchQuery === '' ||
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory === 'all' || server.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // Check if max selections reached
  const isMaxReached = maxSelections !== undefined && selectedServers.length >= maxSelections;

  // Handle server toggle
  const handleToggle = React.useCallback(
    (serverId: string) => {
      if (selectedServers.includes(serverId)) {
        // Remove from selection
        onSelectionChange(selectedServers.filter((id) => id !== serverId));
      } else if (!isMaxReached) {
        // Add to selection
        onSelectionChange([...selectedServers, serverId]);
      }
    },
    [selectedServers, onSelectionChange, isMaxReached]
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Search input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[var(--outline)]">
          search
        </span>
        <input
          type="text"
          placeholder="Search MCP servers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'w-full rounded-[4px] border border-[var(--outline-variant)] bg-white py-2.5 pl-10 pr-4',
            'text-sm text-[var(--on-surface)] placeholder:text-[var(--outline)]',
            'transition-all outline-none',
            'focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--brand-highlight)]/20'
          )}
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_ORDER.map((category) => (
          <CategoryChip
            key={category}
            category={category}
            isActive={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          />
        ))}
      </div>

      {/* Selection counter */}
      {maxSelections !== undefined && (
        <p className="text-sm text-[var(--on-surface-variant)]">
          {selectedServers.length} of {maxSelections} servers selected
        </p>
      )}

      {/* Server grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServers.map((server) => (
          <ServerCard
            key={server.id}
            server={server}
            isSelected={selectedServers.includes(server.id)}
            isDisabled={isMaxReached}
            onToggle={() => handleToggle(server.id)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredServers.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[8px] border border-dashed border-[var(--outline)] bg-[var(--surface-container-low)] py-12">
          <span className="material-symbols-outlined text-4xl text-[var(--outline)]">
            search_off
          </span>
          <div className="text-center">
            <p className="font-medium text-[var(--on-surface-variant)]">No servers found</p>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
