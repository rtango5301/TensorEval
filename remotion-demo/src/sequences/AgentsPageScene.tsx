import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { Sidebar } from '../components/Sidebar';
import { colors, fonts, shadows, statusColors } from '../styles';

// Exact mock data from /src/app/agents/page.tsx - all 6 agents
const agents = [
  {
    id: '1',
    name: 'Support Bot v2.4',
    category: 'Customer Service',
    emoji: '🤖',
    emojiBg: '#eff6ff',
    status: 'Active',
    statusBg: statusColors.active.bg,
    statusText: statusColors.active.text,
    statusBorder: statusColors.active.border,
    accuracy: 94,
    trend: '+2.1%',
    trendUp: true,
    totalRuns: '1.2k',
    lastRun: '2m ago',
  },
  {
    id: '2',
    name: 'Finance Analyzer',
    category: 'Data Processing',
    emoji: '📊',
    emojiBg: '#faf5ff',
    status: 'Failing',
    statusBg: statusColors.failing.bg,
    statusText: statusColors.failing.text,
    statusBorder: statusColors.failing.border,
    accuracy: 68,
    trend: '-5.4%',
    trendUp: false,
    totalRuns: '450',
    lastRun: '1h ago',
  },
  {
    id: '3',
    name: 'Content Gen Alpha',
    category: 'Generative Text',
    emoji: '📝',
    emojiBg: '#eef2ff',
    status: 'Active',
    statusBg: statusColors.active.bg,
    statusText: statusColors.active.text,
    statusBorder: statusColors.active.border,
    accuracy: 88,
    trend: '0%',
    trendUp: null,
    totalRuns: '89',
    lastRun: '1d ago',
  },
  {
    id: '4',
    name: 'Code Reviewer',
    category: 'Development',
    emoji: '🧑‍💻',
    emojiBg: '#fff7ed',
    status: 'Active',
    statusBg: statusColors.active.bg,
    statusText: statusColors.active.text,
    statusBorder: statusColors.active.border,
    accuracy: 91,
    trend: '+0.8%',
    trendUp: true,
    totalRuns: '2.4k',
    lastRun: '15m ago',
  },
  {
    id: '5',
    name: 'Legal Assistant',
    category: 'Legal Review',
    emoji: '⚖️',
    emojiBg: '#f3f4f6',
    status: 'Archived',
    statusBg: statusColors.archived.bg,
    statusText: statusColors.archived.text,
    statusBorder: statusColors.archived.border,
    accuracy: null,
    trend: null,
    trendUp: null,
    totalRuns: '120',
    lastRun: '3mo ago',
  },
  {
    id: '6',
    name: 'Chat QA',
    category: 'Support',
    emoji: '💬',
    emojiBg: '#ccfbf1',
    status: 'Active',
    statusBg: statusColors.active.bg,
    statusText: statusColors.active.text,
    statusBorder: statusColors.active.border,
    accuracy: 76,
    trend: '+12%',
    trendUp: true,
    totalRuns: '3.1k',
    lastRun: '5m ago',
  },
];

const statusFilters = ['All Status', 'Active', 'Failing', 'Archived'];

const VIDEO_FPS = 30;

export const AgentsPageScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Timeline:
  // 0-15: Page fade in
  // 15-35: Title + filter bar animate
  // 35-75: 6 cards stagger in
  // 75-90: Cursor clicks "Create New Agent" button
  // 95-99: Transition fade

  // Page fade in (0-15)
  const pageOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Header opacity (15-30)
  const headerOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: 'clamp' });

  // Title + filter bar animate (15-35)
  const titleY = interpolate(frame, [15, 35], [30, 0], { extrapolateRight: 'clamp' });
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });

  // Card stagger animation (35-75)
  const getCardAnimation = (index: number) => {
    // 6 cards over 40 frames (35-75), so ~6.6 frames delay each
    const delay = 35 + index * 6;
    return {
      opacity: interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateRight: 'clamp' }),
      scale: spring({
        frame: Math.max(0, frame - delay),
        fps: VIDEO_FPS,
        config: { damping: 15, stiffness: 120 },
      }),
      y: interpolate(frame, [delay, delay + 12], [40, 0], { extrapolateRight: 'clamp' }),
    };
  };

  // Cursor animation (75-90): moves to "Create New Agent" button and clicks
  const cursorStartX = 640;
  const cursorStartY = 400;
  const cursorEndX = 1050; // Position of "Create New Agent" button
  const cursorEndY = 115;
  const cursorX = interpolate(frame, [75, 85], [cursorStartX, cursorEndX], {
    extrapolateRight: 'clamp',
  });
  const cursorY = interpolate(frame, [75, 85], [cursorStartY, cursorEndY], {
    extrapolateRight: 'clamp',
  });
  const cursorOpacity = interpolate(frame, [75, 78, 92, 95], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const clickScale = interpolate(frame, [86, 88, 90], [1, 0.95, 1], { extrapolateRight: 'clamp' });
  const buttonHighlight = frame >= 86 && frame <= 90;

  // Transition fade (95-99)
  const fadeOut = interpolate(frame, [95, 99], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        fontFamily: fonts.heading,
        overflow: 'hidden',
        opacity: pageOpacity * fadeOut,
      }}
    >
      {/* Sidebar */}
      <Sidebar activeItem="Agents" animationDelay={0} />

      {/* Main Content */}
      <div
        style={{
          marginLeft: 256,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header - h-14 (56px) */}
        <header
          style={{
            height: 56,
            background: colors.cardBackground,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            opacity: headerOpacity,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: colors.textPrimary,
              fontFamily: fonts.heading,
            }}
          >
            Agents
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Header Search */}
            <div style={{ position: 'relative', width: 256 }}>
              <span
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 18,
                  color: colors.textMuted,
                }}
              >
                🔍
              </span>
              <div
                style={{
                  width: '100%',
                  paddingLeft: 36,
                  paddingRight: 16,
                  paddingTop: 6,
                  paddingBottom: 6,
                  background: colors.surfaceLight,
                  borderRadius: 6,
                  fontSize: 14,
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                }}
              >
                Search agents...
              </div>
            </div>
            {/* Notification & Help Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: colors.surfaceLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                🔔
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    background: colors.error,
                    borderRadius: '50%',
                    border: '2px solid #ffffff',
                  }}
                />
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: colors.surfaceLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ❓
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - p-6 lg:p-10 */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '24px 40px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            {/* Page Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 24,
                transform: `translateY(${titleY}px)`,
                opacity: titleOpacity,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    margin: 0,
                    letterSpacing: '-0.025em',
                    fontFamily: fonts.heading,
                  }}
                >
                  Agents Management
                </h1>
                <p
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginTop: 4,
                    fontFamily: fonts.body,
                  }}
                >
                  Monitor, evaluate, and configure your AI agents.
                </p>
              </div>
              {/* Create New Agent Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: colors.primary,
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: buttonHighlight ? shadows.lg : shadows.primary,
                  fontFamily: fonts.body,
                  transform: `scale(${clickScale})`,
                  border: buttonHighlight ? '2px solid #0ea5e9' : 'none',
                }}
              >
                <span style={{ fontSize: 20 }}>+</span>
                Create New Agent
              </div>
            </div>

            {/* Filter Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 24,
                opacity: titleOpacity,
              }}
            >
              {/* Search Input */}
              <div style={{ position: 'relative', maxWidth: 384 }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 20,
                    color: colors.textMuted,
                  }}
                >
                  🔍
                </span>
                <div
                  style={{
                    paddingLeft: 40,
                    paddingRight: 12,
                    paddingTop: 10,
                    paddingBottom: 10,
                    background: colors.surfaceLight,
                    borderRadius: 8,
                    fontSize: 14,
                    color: colors.textSecondary,
                    width: 220,
                    fontFamily: fonts.body,
                  }}
                >
                  Search by agent name...
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 32, background: colors.border }} />

              {/* Status Filter Chips */}
              <div style={{ display: 'flex', gap: 8 }}>
                {statusFilters.map((filter, i) => (
                  <div
                    key={filter}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 9999,
                      fontSize: 14,
                      fontWeight: 500,
                      background: i === 0 ? colors.textPrimary : colors.cardBackground,
                      color: i === 0 ? '#ffffff' : colors.textSecondary,
                      border: i === 0 ? 'none' : `1px solid ${colors.border}`,
                      fontFamily: fonts.body,
                    }}
                  >
                    {filter}
                  </div>
                ))}
              </div>

              {/* View Toggle */}
              <div
                style={{
                  marginLeft: 'auto',
                  background: colors.surfaceLight,
                  padding: 4,
                  borderRadius: 8,
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    padding: 6,
                    borderRadius: 4,
                    background: colors.cardBackground,
                    boxShadow: shadows.sm,
                  }}
                >
                  ▦
                </div>
                <div style={{ padding: 6, borderRadius: 4, color: colors.textSecondary }}>☰</div>
              </div>
            </div>

            {/* Agent Cards Grid - 3 columns to fit 6 cards nicely */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {agents.map((agent, index) => {
                const anim = getCardAnimation(index);
                const isArchived = agent.status === 'Archived';
                return (
                  <article
                    key={agent.id}
                    style={{
                      background: colors.cardBackground,
                      borderRadius: 12,
                      padding: 20,
                      border: `1px solid ${colors.border}`,
                      boxShadow: shadows.sm,
                      opacity: anim.opacity * (isArchived ? 0.75 : 1),
                      transform: `translateY(${anim.y}px) scale(${Math.max(0.85, anim.scale)})`,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Card Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Emoji Avatar */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: agent.emojiBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
                          }}
                        >
                          {agent.emoji}
                        </div>
                        <div>
                          {/* Agent Name */}
                          <h3
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: colors.textPrimary,
                              lineHeight: 1.2,
                              margin: 0,
                              fontFamily: fonts.heading,
                            }}
                          >
                            {agent.name}
                          </h3>
                          {/* Category */}
                          <p
                            style={{
                              fontSize: 12,
                              color: colors.textSecondary,
                              margin: 0,
                              fontFamily: fonts.body,
                            }}
                          >
                            {agent.category}
                          </p>
                        </div>
                      </div>
                      {/* Status Badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          background: agent.statusBg,
                          color: agent.statusText,
                          border: `1px solid ${agent.statusBorder}`,
                          fontFamily: fonts.body,
                        }}
                      >
                        {agent.status}
                      </span>
                    </div>

                    {/* Accuracy Score */}
                    <div style={{ marginBottom: 20 }}>
                      <div
                        style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}
                      >
                        <span
                          style={{
                            fontSize: 32,
                            fontWeight: 700,
                            color: agent.accuracy === null ? colors.textMuted : colors.textPrimary,
                            fontFamily: fonts.heading,
                          }}
                        >
                          {agent.accuracy !== null ? `${agent.accuracy}%` : '--'}
                        </span>
                        {/* Trend Indicator */}
                        {agent.trend && (
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color:
                                agent.trendUp === true
                                  ? '#16a34a'
                                  : agent.trendUp === false
                                    ? '#dc2626'
                                    : colors.textMuted,
                              marginBottom: 6,
                              display: 'flex',
                              alignItems: 'center',
                              fontFamily: fonts.body,
                            }}
                          >
                            {agent.trendUp === true ? '↗' : agent.trendUp === false ? '↘' : '—'}{' '}
                            {agent.trend}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: colors.textSecondary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          margin: 0,
                          fontFamily: fonts.body,
                        }}
                      >
                        Accuracy Score
                      </p>
                    </div>

                    {/* Stats: Total Runs & Last Run */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 16,
                        marginBottom: 20,
                        paddingTop: 16,
                        borderTop: `1px solid ${colors.borderLight}`,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: colors.textPrimary,
                            margin: 0,
                            fontFamily: fonts.body,
                          }}
                        >
                          {agent.totalRuns}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: colors.textSecondary,
                            margin: 0,
                            fontFamily: fonts.body,
                          }}
                        >
                          Total Runs
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: colors.textPrimary,
                            margin: 0,
                            fontFamily: fonts.body,
                          }}
                        >
                          {agent.lastRun}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: colors.textSecondary,
                            margin: 0,
                            fontFamily: fonts.body,
                          }}
                        >
                          Last Run
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      {isArchived ? (
                        <>
                          <div
                            style={{
                              flex: 1,
                              background: '#e5e7eb',
                              color: colors.textSecondary,
                              padding: '8px 0',
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 700,
                              textAlign: 'center',
                              fontFamily: fonts.body,
                            }}
                          >
                            Restore
                          </div>
                          <div
                            style={{
                              flex: 1,
                              background: colors.cardBackground,
                              color: colors.textPrimary,
                              padding: '8px 0',
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 700,
                              textAlign: 'center',
                              border: `1px solid ${colors.border}`,
                              fontFamily: fonts.body,
                            }}
                          >
                            Logs
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              flex: 1,
                              background: colors.primary,
                              color: '#ffffff',
                              padding: '8px 0',
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 700,
                              textAlign: 'center',
                              fontFamily: fonts.body,
                            }}
                          >
                            Run Eval
                          </div>
                          <div
                            style={{
                              flex: 1,
                              background: colors.cardBackground,
                              color: colors.textPrimary,
                              padding: '8px 0',
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 700,
                              textAlign: 'center',
                              border: `1px solid ${colors.border}`,
                              fontFamily: fonts.body,
                            }}
                          >
                            Configure
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Animated Cursor */}
      <div
        style={{
          position: 'absolute',
          left: cursorX,
          top: cursorY,
          opacity: cursorOpacity,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36z"
            fill="#000"
            stroke="#fff"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
