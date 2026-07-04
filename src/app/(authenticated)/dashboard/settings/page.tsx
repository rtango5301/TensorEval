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
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135bec] focus-visible:ring-offset-2',
        checked ? 'bg-[#135bec]' : 'bg-slate-200',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
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
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
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
          <div className="size-20 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
          </div>
        )}
        <div>
          <button type="button" className="text-sm font-medium text-[#135bec] hover:underline">
            Change photo
          </button>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Role</label>
          <input
            type="text"
            value="User"
            disabled
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-1">Role can only be changed by an admin.</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-slate-200">
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm bg-[#135bec] hover:bg-[#135bec]/90 text-white shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-lg">save</span>
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-8">
      {/* Theme Selection */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">Theme</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'light', label: 'Light', icon: 'light_mode' },
            { id: 'dark', label: 'Dark', icon: 'dark_mode' },
            { id: 'system', label: 'System', icon: 'devices' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id as typeof theme)}
              className={cn(
                'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all',
                theme === option.id
                  ? 'border-[#135bec] bg-[#135bec]/5'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              )}
            >
              <div
                className={cn(
                  'size-12 rounded-full flex items-center justify-center',
                  theme === option.id ? 'bg-[#135bec]/10' : 'bg-slate-100'
                )}
              >
                <span
                  className={cn(
                    'material-symbols-outlined text-2xl',
                    theme === option.id ? 'text-[#135bec]' : 'text-slate-500'
                  )}
                >
                  {option.icon}
                </span>
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  theme === option.id ? 'text-[#135bec]' : 'text-slate-700'
                )}
              >
                {option.label}
              </span>
              <div
                className={cn(
                  'size-5 rounded-full border-2 flex items-center justify-center',
                  theme === option.id ? 'border-[#135bec]' : 'border-slate-300'
                )}
              >
                {theme === option.id && <div className="size-2.5 rounded-full bg-[#135bec]" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Compact Mode */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">Display</h3>
        <div className="flex items-center justify-between py-3 px-4 bg-white border border-slate-200 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-900">Compact mode</p>
            <p className="text-xs text-slate-500">
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
        <h3 className="text-base font-bold text-slate-900 mb-1">Generate API Key</h3>
        <p className="text-sm text-slate-500 mb-4">
          Use this key to authenticate the Python SDK. You can create more than one key for local
          development, CI, or separate machines.
        </p>

        {/* Show plaintext once after creation */}
        {createdKey && (
          <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-amber-600">warning</span>
              <p className="text-sm font-bold text-amber-900">
                Copy your key now — it won&apos;t be shown again.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-white border border-amber-200 px-3 py-2 text-sm font-mono text-slate-800 break-all">
                {createdKey.plaintext_key}
              </code>
              <button
                type="button"
                onClick={copyKey}
                className="shrink-0 px-3 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
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
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
          />
          <button
            type="button"
            onClick={handleCreateKey}
            disabled={!newKeyName.trim()}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm bg-[#135bec] hover:bg-[#135bec]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Generate
          </button>
        </div>
      </div>

      {keyError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {keyError}
        </div>
      )}

      {/* Existing keys list */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">Your API Keys</h3>
        {loadingKeys ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : apiKeys.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">vpn_key_off</span>
            <p className="text-sm text-slate-400 mt-2">No API keys yet. Generate one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-400">key</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">{key.name}</p>
                    <code className="text-xs text-slate-400 font-mono">{key.key_prefix}...</code>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
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
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-slate-600">download</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Export Data</h3>
            <p className="text-sm text-slate-500 mt-1">
              Download all your agents, evaluations, and settings in a portable format.
            </p>
            <button
              type="button"
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">file_download</span>
              Export All Data
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-red-600">delete_forever</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-red-900">Delete Account</h3>
            <p className="text-sm text-red-700 mt-1">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              type="button"
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your account preferences and settings.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Settings tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-[#135bec] text-[#135bec]'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
