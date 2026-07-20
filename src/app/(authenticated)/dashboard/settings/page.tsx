// Settings Page - Manage account preferences and team settings
// Route: /dashboard/settings

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/user-context';
import { listApiKeys, createApiKey, type ApiKey, type CreatedApiKey } from '@/lib/api/api-keys';
import { ApiError } from '@/lib/api/client';

// ============================================================================
// TOGGLE COMPONENT
// ============================================================================

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-[8px] border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2',
        checked ? 'bg-[var(--primary)]' : 'bg-[var(--surface-container)]',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-[4px] bg-white ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

// ============================================================================
// TAB DEFINITIONS
// ============================================================================

type TabId = 'profile' | 'apiKeys' | 'appearance' | 'danger';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'apiKeys', label: 'API Keys', icon: 'key' },
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'danger', label: 'Danger Zone', icon: 'warning' },
];

// ============================================================================
// MAIN SETTINGS PAGE
// ============================================================================

export default function SettingsPage() {
  const user = useUser();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Profile state - initialized from user context
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  // Update form when user data changes
  useEffect(() => {
    setFullName(user.name);
    setEmail(user.email);
  }, [user.name, user.email]);

  // Appearance state
  const [compactMode, setCompactMode] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [copied, setCopied] = useState(false);

  const refreshKeys = async () => {
    setLoadingKeys(true);
    setKeyError('');
    try {
      setApiKeys(await listApiKeys());
    } catch (err) {
      setKeyError(err instanceof ApiError ? err.message : 'Failed to load keys');
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'apiKeys') refreshKeys();
  }, [activeTab]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setKeyError('');
    try {
      const created = await createApiKey(newKeyName.trim());
      setCreatedKey(created);
      setNewKeyName('');
      refreshKeys();
    } catch (err) {
      setKeyError(err instanceof ApiError ? err.message : 'Failed to create key');
    }
  };

  const copyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey.plaintext_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-4">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={`${user.name}'s avatar`}
            width={80}
            height={80}
            className="size-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full bg-[var(--surface-container)]">
            <span className="material-symbols-outlined text-4xl text-[var(--outline)]">person</span>
          </div>
        )}
        <div>
          <button
            type="button"
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Change photo
          </button>
          <p className="mt-1 text-xs text-[var(--on-surface-variant)]">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--on-surface)]">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white px-4 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--on-surface)]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[4px] border border-[var(--outline-variant)] bg-white px-4 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-[var(--on-surface)]">Role</label>
          <input
            type="text"
            value="User"
            disabled
            className="w-full cursor-not-allowed rounded-[4px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-2.5 text-sm text-[var(--on-surface-variant)]"
          />
          <p className="mt-1 text-xs text-[var(--outline)]">
            Role can only be changed by an admin.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-[var(--outline-variant)] pt-4">
        <button
          type="button"
          className="flex items-center gap-2 rounded-[4px] bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
        >
          <span className="material-symbols-outlined text-lg">save</span>
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-8">
      {/* Compact Mode */}
      <div>
        <h3 className="font-display mb-4 text-base font-bold text-[var(--on-surface)]">Display</h3>
        <div className="flex items-center justify-between rounded-[8px] border border-[var(--outline-variant)] bg-white px-4 py-3">
          <div>
            <p className="text-sm font-medium text-[var(--on-surface)]">Compact mode</p>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Reduce spacing and padding throughout the interface.
            </p>
          </div>
          <Toggle checked={compactMode} onChange={setCompactMode} />
        </div>
      </div>
    </div>
  );

  const renderApiKeysTab = () => (
    <div className="space-y-6">
      {/* New key creation */}
      <div>
        <h3 className="font-display mb-1 text-base font-bold text-[var(--on-surface)]">
          Generate API Key
        </h3>
        <p className="mb-4 text-sm text-[var(--on-surface-variant)]">
          Use this key to authenticate the Python SDK. You can create more than one key for local
          development, CI, or separate machines.
        </p>

        {/* Show plaintext once after creation */}
        {createdKey && (
          <div className="mb-4 rounded-[8px] border-2 border-amber-300 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-amber-600">warning</span>
              <p className="text-sm font-bold text-amber-900">
                Copy your key now — it won&apos;t be shown again.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded-[4px] border border-amber-200 bg-white px-3 py-2 font-mono text-sm text-[var(--on-surface)]">
                {createdKey.plaintext_key}
              </code>
              <button
                type="button"
                onClick={copyKey}
                className="shrink-0 rounded-[4px] bg-amber-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCreatedKey(null)}
              className="mt-2 text-xs text-amber-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. local-dev, ci-pipeline)"
            className="flex-1 rounded-[4px] border border-[var(--outline-variant)] bg-white px-4 py-2.5 text-sm text-[var(--on-surface)] transition-colors placeholder:text-[var(--outline)] focus:border-transparent focus:ring-2 focus:ring-[var(--brand-highlight)]"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
          />
          <button
            type="button"
            onClick={handleCreateKey}
            disabled={!newKeyName.trim()}
            className="flex shrink-0 items-center gap-2 rounded-[4px] bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Generate
          </button>
        </div>
      </div>

      {keyError && (
        <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {keyError}
        </div>
      )}

      {/* Existing keys list */}
      <div>
        <h3 className="font-display mb-4 text-base font-bold text-[var(--on-surface)]">
          Your API Keys
        </h3>
        {loadingKeys ? (
          <p className="text-sm text-[var(--outline)]">Loading...</p>
        ) : apiKeys.length === 0 ? (
          <div className="rounded-[8px] border border-dashed border-[var(--outline-variant)] p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[var(--outline)]">
              vpn_key_off
            </span>
            <p className="mt-2 text-sm text-[var(--outline)]">
              No API keys yet. Generate one above.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center gap-4 rounded-[8px] border border-[var(--outline-variant)] bg-white px-4 py-3 transition-colors"
              >
                <span className="material-symbols-outlined text-[var(--outline)]">key</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-[var(--on-surface)]">
                      {key.name}
                    </p>
                    <code className="font-mono text-xs text-[var(--outline)]">
                      {key.key_prefix}...
                    </code>
                    <span className="rounded-[4px] bg-[var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--success-foreground)]">
                      Active
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--outline)]">
                    Created {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at &&
                      ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDangerZoneTab = () => (
    <div className="space-y-6">
      {/* Export Data */}
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--surface-container-low)]">
            <span className="material-symbols-outlined text-[var(--on-surface-variant)]">
              download
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-bold text-[var(--on-surface)]">
              Export Data
            </h3>
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
              Download all your agents, evaluations, and settings in a portable format.
            </p>
            <button
              type="button"
              className="mt-4 flex items-center gap-2 rounded-[4px] border border-[var(--outline-variant)] bg-white px-4 py-2 text-sm font-medium text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)]"
            >
              <span className="material-symbols-outlined text-lg">file_download</span>
              Export All Data
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-red-100">
            <span className="material-symbols-outlined text-red-600">delete_forever</span>
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-bold text-red-900">Delete Account</h3>
            <p className="text-sm text-red-700 mt-1">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              type="button"
              className="mt-4 flex items-center gap-2 rounded-[4px] bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'apiKeys':
        return renderApiKeysTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'danger':
        return renderDangerZoneTab();
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--on-surface)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--on-surface-variant)]">
          Manage your account preferences and settings.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--outline-variant)]">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Settings tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--on-surface-variant)] hover:border-[var(--outline)] hover:text-[var(--on-surface)]'
              )}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="rounded-[8px] border border-[var(--outline-variant)] bg-white p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
