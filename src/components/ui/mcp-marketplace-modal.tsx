'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

type MCPCategory =
  | 'databases'
  | 'cloud-services'
  | 'developer-tools'
  | 'communication'
  | 'productivity'
  | 'ai-ml'
  | 'storage'
  | 'monitoring';

interface MCPServer {
  id: string;
  name: string;
  description: string;
  category: MCPCategory;
  icon: string; // Material Symbols icon name
}

interface MCPMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServers: string[];
  onSelectionChange: (serverIds: string[]) => void;
  maxSelections?: number;
}

// ============================================================================
// MCP Server Data (40 servers across 8 categories)
// ============================================================================

const MCP_SERVERS: MCPServer[] = [
  // Databases (6)
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    description: 'Advanced open-source relational database',
    category: 'databases',
    icon: 'database',
  },
  {
    id: 'mysql',
    name: 'MySQL',
    description: 'Popular open-source SQL database',
    category: 'databases',
    icon: 'storage',
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'Document-oriented NoSQL database',
    category: 'databases',
    icon: 'inventory_2',
  },
  {
    id: 'redis',
    name: 'Redis',
    description: 'In-memory data structure store',
    category: 'databases',
    icon: 'bolt',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Open source Firebase alternative',
    category: 'databases',
    icon: 'electric_bolt',
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    description: 'Lightweight embedded SQL database',
    category: 'databases',
    icon: 'data_object',
  },

  // Cloud Services (6)
  {
    id: 'aws',
    name: 'AWS',
    description: 'Amazon Web Services cloud platform',
    category: 'cloud-services',
    icon: 'cloud',
  },
  {
    id: 'gcp',
    name: 'Google Cloud',
    description: 'Google Cloud Platform services',
    category: 'cloud-services',
    icon: 'cloud_circle',
  },
  {
    id: 'azure',
    name: 'Azure',
    description: 'Microsoft Azure cloud services',
    category: 'cloud-services',
    icon: 'cloud_queue',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Frontend cloud platform',
    category: 'cloud-services',
    icon: 'rocket_launch',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'Global cloud network and security',
    category: 'cloud-services',
    icon: 'shield',
  },
  {
    id: 'heroku',
    name: 'Heroku',
    description: 'Cloud application platform',
    category: 'cloud-services',
    icon: 'apps',
  },

  // Developer Tools (7)
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code hosting and collaboration',
    category: 'developer-tools',
    icon: 'code',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'DevOps platform with Git repository',
    category: 'developer-tools',
    icon: 'integration_instructions',
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    description: 'Git repository management',
    category: 'developer-tools',
    icon: 'source',
  },
  {
    id: 'docker',
    name: 'Docker',
    description: 'Container platform',
    category: 'developer-tools',
    icon: 'deployed_code',
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    description: 'Container orchestration system',
    category: 'developer-tools',
    icon: 'hub',
  },
  {
    id: 'terraform',
    name: 'Terraform',
    description: 'Infrastructure as code tool',
    category: 'developer-tools',
    icon: 'build',
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    description: 'Automation server for CI/CD',
    category: 'developer-tools',
    icon: 'settings_applications',
  },

  // Communication (5)
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team messaging platform',
    category: 'communication',
    icon: 'chat',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Community messaging platform',
    category: 'communication',
    icon: 'forum',
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Cloud communications API',
    category: 'communication',
    icon: 'phone_in_talk',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery service',
    category: 'communication',
    icon: 'mail',
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Customer messaging platform',
    category: 'communication',
    icon: 'support_agent',
  },

  // Productivity (5)
  {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace',
    category: 'productivity',
    icon: 'edit_note',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Spreadsheet-database hybrid',
    category: 'productivity',
    icon: 'table_chart',
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Issue tracking for modern teams',
    category: 'productivity',
    icon: 'linear_scale',
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Work management platform',
    category: 'productivity',
    icon: 'task_alt',
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Kanban-style project boards',
    category: 'productivity',
    icon: 'dashboard',
  },

  // AI/ML (4)
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT and DALL-E APIs',
    category: 'ai-ml',
    icon: 'smart_toy',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude AI assistant API',
    category: 'ai-ml',
    icon: 'psychology',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'ML model hub and inference',
    category: 'ai-ml',
    icon: 'model_training',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Run ML models in the cloud',
    category: 'ai-ml',
    icon: 'auto_awesome',
  },

  // Storage (4)
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Local file system access',
    category: 'storage',
    icon: 'folder',
  },
  {
    id: 's3',
    name: 'Amazon S3',
    description: 'Scalable object storage',
    category: 'storage',
    icon: 'cloud_upload',
  },
  {
    id: 'gcs',
    name: 'Google Cloud Storage',
    description: 'Unified object storage',
    category: 'storage',
    icon: 'cloud_download',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Cloud file storage and sync',
    category: 'storage',
    icon: 'cloud_sync',
  },

  // Monitoring (3)
  {
    id: 'datadog',
    name: 'Datadog',
    description: 'Cloud monitoring and analytics',
    category: 'monitoring',
    icon: 'monitoring',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description: 'Error tracking and performance',
    category: 'monitoring',
    icon: 'bug_report',
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Observability dashboards',
    category: 'monitoring',
    icon: 'analytics',
  },
];

// Category metadata for display
const CATEGORY_META: Record<MCPCategory, { label: string; icon: string }> = {
  databases: { label: 'Databases', icon: 'database' },
  'cloud-services': { label: 'Cloud Services', icon: 'cloud' },
  'developer-tools': { label: 'Developer Tools', icon: 'build' },
  communication: { label: 'Communication', icon: 'chat' },
  productivity: { label: 'Productivity', icon: 'task_alt' },
  'ai-ml': { label: 'AI & Machine Learning', icon: 'psychology' },
  storage: { label: 'Storage', icon: 'folder' },
  monitoring: { label: 'Monitoring', icon: 'monitoring' },
};

// Category order for consistent display
const CATEGORY_ORDER: MCPCategory[] = [
  'databases',
  'cloud-services',
  'developer-tools',
  'communication',
  'productivity',
  'ai-ml',
  'storage',
  'monitoring',
];

// ============================================================================
// Material Symbols Icon Component
// ============================================================================

interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

function MaterialIcon({ name, className, filled = false }: MaterialIconProps) {
  return (
    <span
      className={cn(
        'material-symbols-outlined select-none',
        filled && 'material-symbols-filled',
        className
      )}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

// ============================================================================
// Server Card Component
// ============================================================================

interface ServerCardProps {
  server: MCPServer;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

function ServerCard({ server, isSelected, isDisabled, onToggle }: ServerCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      disabled={isDisabled && !isSelected}
      whileHover={{ scale: isDisabled && !isSelected ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled && !isSelected ? 1 : 0.98 }}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2',
        isSelected
          ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
          : 'border-[var(--outline-variant)] bg-white hover:border-[var(--outline)] hover:bg-[var(--surface-container-low)]',
        isDisabled && !isSelected && 'cursor-not-allowed opacity-50'
      )}
      aria-pressed={isSelected}
      aria-label={`${server.name}: ${server.description}. ${isSelected ? 'Selected' : 'Not selected'}`}
    >
      {/* Icon container */}
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
          isSelected
            ? 'bg-[var(--surface-container)] text-[var(--primary)]'
            : 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]'
        )}
      >
        <MaterialIcon name={server.icon} className="text-xl" />
      </div>

      {/* Text content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium',
            isSelected ? 'text-[var(--primary)]' : 'text-[var(--on-surface)]'
          )}
        >
          {server.name}
        </p>
        <p className="truncate text-xs text-[var(--on-surface-variant)]">{server.description}</p>
      </div>

      {/* Selection indicator */}
      <div
        className={cn(
          'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all',
          isSelected
            ? 'border-[var(--primary)] bg-[var(--primary)]'
            : 'border-[var(--outline)] bg-white'
        )}
      >
        {isSelected && <MaterialIcon name="check" className="text-sm text-white" />}
      </div>
    </motion.button>
  );
}

// ============================================================================
// Category Section Component
// ============================================================================

interface CategorySectionProps {
  category: MCPCategory;
  servers: MCPServer[];
  selectedServers: string[];
  maxReached: boolean;
  onToggle: (serverId: string) => void;
}

function CategorySection({
  category,
  servers,
  selectedServers,
  maxReached,
  onToggle,
}: CategorySectionProps) {
  const meta = CATEGORY_META[category];

  return (
    <section id={`category-${category}`} className="scroll-mt-4">
      {/* Category header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[var(--surface-container-low)]">
          <MaterialIcon name={meta.icon} className="text-base text-[var(--on-surface-variant)]" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--on-surface)]">{meta.label}</h3>
        <span className="text-xs text-[var(--outline)]">({servers.length})</span>
      </div>

      {/* Server grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {servers.map((server) => (
          <ServerCard
            key={server.id}
            server={server}
            isSelected={selectedServers.includes(server.id)}
            isDisabled={maxReached}
            onToggle={() => onToggle(server.id)}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// Main Modal Component
// ============================================================================

export function MCPMarketplaceModal({
  isOpen,
  onClose,
  selectedServers,
  onSelectionChange,
  maxSelections = 3,
}: MCPMarketplaceModalProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [localSelection, setLocalSelection] = React.useState<string[]>(selectedServers);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Sync local selection with prop when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalSelection(selectedServers);
      setSearchQuery('');
    }
  }, [isOpen, selectedServers]);

  // Focus search input when modal opens
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure modal animation has started
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key to close
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Filter servers based on search query
  const filteredServers = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return MCP_SERVERS;
    }

    const query = searchQuery.toLowerCase();
    return MCP_SERVERS.filter(
      (server) =>
        server.name.toLowerCase().includes(query) ||
        server.description.toLowerCase().includes(query) ||
        CATEGORY_META[server.category].label.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group filtered servers by category
  const serversByCategory = React.useMemo(() => {
    const grouped: Partial<Record<MCPCategory, MCPServer[]>> = {};

    for (const server of filteredServers) {
      if (!grouped[server.category]) {
        grouped[server.category] = [];
      }
      grouped[server.category]!.push(server);
    }

    return grouped;
  }, [filteredServers]);

  // Categories with servers (in order)
  const activeCategories = CATEGORY_ORDER.filter((cat) => serversByCategory[cat]?.length);

  // Toggle server selection
  const toggleServer = React.useCallback(
    (serverId: string) => {
      setLocalSelection((prev) => {
        if (prev.includes(serverId)) {
          return prev.filter((id) => id !== serverId);
        }
        if (prev.length >= maxSelections) {
          return prev;
        }
        return [...prev, serverId];
      });
    },
    [maxSelections]
  );

  // Handle confirm
  const handleConfirm = React.useCallback(() => {
    onSelectionChange(localSelection);
    onClose();
  }, [localSelection, onSelectionChange, onClose]);

  // Check if max selections reached
  const maxReached = localSelection.length >= maxSelections;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[8px] bg-[var(--background)] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mcp-modal-title"
          >
            {/* Fixed Header */}
            <div className="flex-shrink-0 border-b border-[var(--outline-variant)] bg-white px-6 py-4">
              {/* Title row */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2
                    id="mcp-modal-title"
                    className="font-display text-lg font-bold text-[var(--on-surface)]"
                  >
                    MCP Marketplace
                  </h2>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Select up to {maxSelections} servers to connect
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] text-[var(--outline)] transition-colors hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface-variant)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2"
                  aria-label="Close modal"
                >
                  <MaterialIcon name="close" className="text-xl" />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <MaterialIcon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[var(--outline)]"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search servers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-[4px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] pl-10 pr-4 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)]/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--outline)] hover:text-[var(--on-surface-variant)]"
                    aria-label="Clear search"
                  >
                    <MaterialIcon name="close" className="text-lg" />
                  </button>
                )}
              </div>

              {/* Category quick nav */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {CATEGORY_ORDER.map((category) => {
                  const meta = CATEGORY_META[category];
                  const hasServers = serversByCategory[category]?.length;
                  const selectedInCategory =
                    serversByCategory[category]?.filter((s) => localSelection.includes(s.id))
                      .length || 0;

                  return (
                    <button
                      key={category}
                      type="button"
                      disabled={!hasServers}
                      onClick={() => {
                        const element = document.getElementById(`category-${category}`);
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-[4px] px-2.5 py-1 text-xs font-medium transition-colors',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2',
                        hasServers
                          ? selectedInCategory > 0
                            ? 'bg-[var(--surface-container)] text-[var(--primary)]'
                            : 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]'
                          : 'cursor-not-allowed bg-[var(--surface-container-low)] text-[var(--outline-variant)]'
                      )}
                    >
                      {meta.label}
                      {selectedInCategory > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[var(--primary)] text-[10px] text-white">
                          {selectedInCategory}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activeCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[4px] bg-[var(--surface-container-low)]">
                    <MaterialIcon name="search_off" className="text-2xl text-[var(--outline)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--on-surface)]">No servers found</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">
                    Try adjusting your search query
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeCategories.map((category) => (
                    <CategorySection
                      key={category}
                      category={category}
                      servers={serversByCategory[category]!}
                      selectedServers={localSelection}
                      maxReached={maxReached}
                      onToggle={toggleServer}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="flex-shrink-0 border-t border-[var(--outline-variant)] bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Selection count */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {localSelection.slice(0, 3).map((serverId) => {
                      const server = MCP_SERVERS.find((s) => s.id === serverId);
                      if (!server) return null;
                      return (
                        <div
                          key={serverId}
                          className="flex h-7 w-7 items-center justify-center rounded-[4px] border-2 border-white bg-[var(--surface-container)] text-[var(--primary)]"
                          title={server.name}
                        >
                          <MaterialIcon name={server.icon} className="text-sm" />
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-sm text-[var(--on-surface-variant)]">
                    <span
                      className={cn(
                        'font-semibold',
                        localSelection.length > 0
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--outline)]'
                      )}
                    >
                      {localSelection.length}
                    </span>
                    <span className="text-[var(--outline)]"> / {maxSelections} selected</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-[4px] px-4 py-2 text-sm font-medium text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2"
                  >
                    <MaterialIcon name="check" className="text-lg" />
                    Confirm Selection
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Export types and data for external usage
export { MCP_SERVERS, CATEGORY_META, CATEGORY_ORDER };
export type { MCPServer, MCPCategory, MCPMarketplaceModalProps };
