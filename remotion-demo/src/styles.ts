// TensorEval Admin Console Theme
// Matches the blue theme from the actual dashboard UI

export const colors = {
  // Primary (TensorEval Blue)
  primary: '#135bec',
  primaryLight: '#135bec',
  primaryGradient: 'linear-gradient(135deg, #135bec 0%, #3b82f6 100%)',
  primaryBg: 'rgba(19, 91, 236, 0.1)',

  // Backgrounds
  background: '#f6f6f8',
  cardBackground: '#ffffff',
  surfaceLight: '#f1f5f9',
  headerBg: '#f8fafc',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',

  // Status
  success: '#10b981',
  successLight: '#d1fae5',
  successBorder: '#a7f3d0',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  errorBorder: '#fecaca',

  // Borders
  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  // Agent card emoji backgrounds
  agentBlue: '#dbeafe',
  agentPurple: '#ede9fe',
  agentOrange: '#ffedd5',
  agentTeal: '#ccfbf1',
  agentGray: '#f3f4f6',
  agentPink: '#fce7f3',
};

export const fonts = {
  heading: "'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'SF Mono', 'Fira Code', monospace",
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  primary: '0 4px 14px 0 rgba(19, 91, 236, 0.3)',
};

// Video settings - 20 seconds for 6 scenes
export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const DURATION_SECONDS = 20;
export const TOTAL_FRAMES = VIDEO_FPS * DURATION_SECONDS; // 600 frames

// Scene timing (in frames) - 6 scenes, ~3.3s each (100 frames)
export const SCENE_FRAMES = {
  dashboard: { start: 0, duration: 100 }, // 0-3.3s - Dashboard
  agentsPage: { start: 100, duration: 100 }, // 3.3-6.7s - Agents Management
  newAgentPage: { start: 200, duration: 100 }, // 6.7-10s - Create Agent Step 1
  configurePage: { start: 300, duration: 100 }, // 10-13.3s - Configure (Step 2)
  reviewPage: { start: 400, duration: 100 }, // 13.3-16.7s - Review (Step 3)
  successPage: { start: 500, duration: 100 }, // 16.7-20s - Success State
};

// Status badge colors (matching Tailwind classes from actual UI)
export const statusColors = {
  active: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  failing: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
  running: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  idle: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
  archived: { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
  completed: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  processing: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
};
