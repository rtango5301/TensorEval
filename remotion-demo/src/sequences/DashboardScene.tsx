import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { colors, fonts, shadows, statusColors } from '../styles';
import { Sidebar } from '../components/Sidebar';

// Mock data from src/app/dashboard/page.tsx
const agents = [
  {
    id: '1',
    name: 'Support Bot',
    icon: 'S',
    iconBg: 'rgba(19, 91, 236, 0.1)',
    iconColor: colors.primary,
    status: 'Active',
    statusColor: statusColors.active,
    type: 'Customer Service Automation',
    lastRun: '2m ago',
  },
  {
    id: '2',
    name: 'Data Analyst',
    icon: 'A',
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    status: 'Running',
    statusColor: statusColors.running,
    type: 'Financial Report Analysis',
    lastRun: '15m ago',
  },
  {
    id: '3',
    name: 'Browser Agent',
    icon: 'B',
    iconBg: '#ffedd5',
    iconColor: '#ea580c',
    status: 'Idle',
    statusColor: statusColors.idle,
    type: 'Web Scraping & Summary',
    lastRun: '1h ago',
  },
  {
    id: '4',
    name: 'Content Writer',
    icon: 'C',
    iconBg: '#fce7f3',
    iconColor: '#db2777',
    status: 'Failed',
    statusColor: statusColors.failing,
    type: 'Blog Post Generation',
    lastRun: '3h ago',
  },
];

const evaluationRuns = [
  {
    id: 'RUN-2024',
    agentName: 'Support Bot',
    icon: 'S',
    iconBg: 'rgba(19, 91, 236, 0.1)',
    iconColor: colors.primary,
    date: '2 mins ago',
    accuracy: '98.5%',
    accuracyColor: colors.textPrimary,
    status: 'Completed',
    statusColor: statusColors.completed,
  },
  {
    id: 'RUN-2023',
    agentName: 'Data Analyst',
    icon: 'A',
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    date: '15 mins ago',
    accuracy: '--',
    accuracyColor: colors.textMuted,
    status: 'Processing',
    statusColor: statusColors.processing,
  },
  {
    id: 'RUN-2022',
    agentName: 'Browser Agent',
    icon: 'B',
    iconBg: '#ffedd5',
    iconColor: '#ea580c',
    date: '1 hr ago',
    accuracy: '92.4%',
    accuracyColor: colors.textPrimary,
    status: 'Completed',
    statusColor: statusColors.completed,
  },
  {
    id: 'RUN-2021',
    agentName: 'Content Writer',
    icon: 'C',
    iconBg: '#fce7f3',
    iconColor: '#db2777',
    date: '3 hrs ago',
    accuracy: '45.0%',
    accuracyColor: '#dc2626',
    status: 'Failed',
    statusColor: statusColors.failing,
  },
];

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Animation timings
  const headerOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' });
  const headerY = interpolate(frame, [20, 35], [20, 0], { extrapolateRight: 'clamp' });

  // Tables animation
  const table1Opacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: 'clamp' });
  const table1Y = interpolate(frame, [30, 45], [20, 0], { extrapolateRight: 'clamp' });

  const table2Opacity = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: 'clamp' });
  const table2Y = interpolate(frame, [40, 55], [20, 0], { extrapolateRight: 'clamp' });

  // Row stagger for agents table
  const getAgentRowAnim = (index: number) => {
    const delay = 35 + index * 5;
    return {
      opacity: interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateRight: 'clamp' }),
      x: interpolate(frame, [delay, delay + 10], [-20, 0], { extrapolateRight: 'clamp' }),
    };
  };

  // Row stagger for runs table
  const getRunRowAnim = (index: number) => {
    const delay = 50 + index * 5;
    return {
      opacity: interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateRight: 'clamp' }),
      x: interpolate(frame, [delay, delay + 10], [-20, 0], { extrapolateRight: 'clamp' }),
    };
  };

  // Cursor animation - moves to Agents nav item
  const cursorX = interpolate(frame, [75, 88], [500, 135], { extrapolateRight: 'clamp' });
  const cursorY = interpolate(frame, [75, 88], [350, 168], { extrapolateRight: 'clamp' });
  const cursorOpacity = interpolate(frame, [75, 80, 95, 100], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const clickScale = interpolate(frame, [90, 93, 96], [1, 0.95, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        fontFamily: fonts.heading,
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <Sidebar activeItem="Dashboard" animationDelay={0} />

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
        {/* Header */}
        <header
          style={{
            height: 56,
            background: colors.cardBackground,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
            opacity: headerOpacity,
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
            Dashboard
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: colors.surfaceLight,
                borderRadius: 6,
                width: 200,
              }}
            >
              <span style={{ fontSize: 14, color: colors.textMuted }}>🔍</span>
              <span style={{ fontSize: 14, color: colors.textMuted, fontFamily: fonts.body }}>
                Search...
              </span>
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
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 16 }}>🔔</span>
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: colors.error,
                  border: '2px solid white',
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '24px 32px', overflow: 'hidden' }}>
          <div style={{ maxWidth: 1200 }}>
            {/* Page Title */}
            <div
              style={{
                marginBottom: 24,
                opacity: headerOpacity,
                transform: `translateY(${headerY}px)`,
              }}
            >
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  margin: 0,
                  fontFamily: fonts.heading,
                  letterSpacing: '-0.025em',
                }}
              >
                Welcome back, Alex
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 4,
                  fontFamily: fonts.body,
                }}
              >
                Here&apos;s an overview of your agents and recent runs.
              </p>
            </div>

            {/* My Agents Table */}
            <div
              style={{
                marginBottom: 24,
                opacity: table1Opacity,
                transform: `translateY(${table1Y}px)`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    margin: 0,
                    fontFamily: fonts.heading,
                  }}
                >
                  My Agents
                </h3>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: colors.primary,
                    fontFamily: fonts.body,
                  }}
                >
                  View All
                </span>
              </div>

              <div
                style={{
                  background: colors.cardBackground,
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  boxShadow: shadows.sm,
                  overflow: 'hidden',
                }}
              >
                {/* Table Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 2fr 1fr',
                    padding: '12px 20px',
                    background: '#f8fafc',
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  {['Agent Name', 'Status', 'Type', 'Last Run'].map((header, i) => (
                    <span
                      key={header}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: fonts.body,
                        textAlign: i === 3 ? 'right' : 'left',
                      }}
                    >
                      {header}
                    </span>
                  ))}
                </div>

                {/* Table Rows */}
                {agents.map((agent, index) => {
                  const anim = getAgentRowAnim(index);
                  return (
                    <div
                      key={agent.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 2fr 1fr',
                        padding: '14px 20px',
                        borderBottom:
                          index < agents.length - 1 ? `1px solid ${colors.border}` : 'none',
                        alignItems: 'center',
                        opacity: anim.opacity,
                        transform: `translateX(${anim.x}px)`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: agent.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: agent.iconColor,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {agent.icon}
                        </div>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: colors.textPrimary,
                            fontFamily: fonts.body,
                          }}
                        >
                          {agent.name}
                        </span>
                      </div>
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '2px 8px',
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 600,
                          background: agent.statusColor.bg,
                          color: agent.statusColor.text,
                          fontFamily: fonts.body,
                          width: 'fit-content',
                        }}
                      >
                        {agent.status}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: colors.textSecondary,
                          fontFamily: fonts.body,
                        }}
                      >
                        {agent.type}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: colors.textSecondary,
                          fontFamily: fonts.body,
                          textAlign: 'right',
                        }}
                      >
                        {agent.lastRun}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Evaluation Runs Table */}
            <div
              style={{
                opacity: table2Opacity,
                transform: `translateY(${table2Y}px)`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    margin: 0,
                    fontFamily: fonts.heading,
                  }}
                >
                  Recent Evaluation Runs
                </h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: `1px solid ${colors.border}`,
                      background: colors.cardBackground,
                      fontSize: 12,
                      fontWeight: 500,
                      color: colors.textSecondary,
                      fontFamily: fonts.body,
                    }}
                  >
                    Filter
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: `1px solid ${colors.border}`,
                      background: colors.cardBackground,
                      fontSize: 12,
                      fontWeight: 500,
                      color: colors.textSecondary,
                      fontFamily: fonts.body,
                    }}
                  >
                    Export
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: colors.cardBackground,
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  boxShadow: shadows.sm,
                  overflow: 'hidden',
                }}
              >
                {/* Table Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    padding: '12px 20px',
                    background: '#f8fafc',
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  {['Agent Name', 'Run ID', 'Date', 'Accuracy', 'Status'].map((header, i) => (
                    <span
                      key={header}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: fonts.body,
                        textAlign: i >= 3 ? 'right' : 'left',
                      }}
                    >
                      {header}
                    </span>
                  ))}
                </div>

                {/* Table Rows */}
                {evaluationRuns.map((run, index) => {
                  const anim = getRunRowAnim(index);
                  return (
                    <div
                      key={run.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                        padding: '14px 20px',
                        borderBottom:
                          index < evaluationRuns.length - 1 ? `1px solid ${colors.border}` : 'none',
                        alignItems: 'center',
                        opacity: anim.opacity,
                        transform: `translateX(${anim.x}px)`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            background: run.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: run.iconColor,
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {run.icon}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: colors.textPrimary,
                            fontFamily: fonts.body,
                          }}
                        >
                          {run.agentName}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          color: colors.textSecondary,
                          fontFamily: fonts.mono,
                        }}
                      >
                        #{run.id}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: colors.textSecondary,
                          fontFamily: fonts.body,
                        }}
                      >
                        {run.date}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: run.accuracyColor,
                          fontFamily: fonts.body,
                          textAlign: 'right',
                        }}
                      >
                        {run.accuracy}
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background: run.statusColor.bg,
                            color: run.statusColor.text,
                            border: `1px solid ${run.statusColor.border}`,
                            fontFamily: fonts.body,
                          }}
                        >
                          {run.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cursor */}
      <div
        style={{
          position: 'absolute',
          left: cursorX,
          top: cursorY,
          opacity: cursorOpacity,
          pointerEvents: 'none',
          zIndex: 100,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
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
