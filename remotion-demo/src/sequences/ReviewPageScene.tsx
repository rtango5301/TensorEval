import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { colors, shadows, fonts } from '../styles';
import { Sidebar } from '../components/Sidebar';
import { ProgressSteps } from '../components/ProgressSteps';

// Get today's date formatted
const getTodayDate = () => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// MCP servers to display
const mcpServers = [
  { id: 'gmail', name: 'Gmail', icon: 'M' },
  { id: 'slack', name: 'Slack', icon: 'S' },
  { id: 'github', name: 'GitHub', icon: 'G' },
];

// Estimated run summary stats
const runStats = [
  { label: 'Total Tests', value: 50, suffix: '' },
  { label: 'Est. Time', value: 25, suffix: 's' },
  { label: 'Est. Cost', value: 0.1, suffix: '', prefix: '$', decimals: 2 },
  { label: 'Status', value: 'Ready', isStatus: true },
];

export const ReviewPageScene: React.FC = () => {
  const frame = useCurrentFrame();

  // ============================================
  // ANIMATION TIMELINE
  // ============================================

  // 0-15: Page fade in
  const pageOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // 15-55: 4 sections stagger in (10 frames each, staggered by 10 frames)
  const getSectionAnim = (index: number) => {
    const startFrame = 15 + index * 10;
    const endFrame = startFrame + 15;
    return {
      opacity: interpolate(frame, [startFrame, endFrame], [0, 1], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp',
      }),
      y: interpolate(frame, [startFrame, endFrame], [20, 0], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp',
      }),
    };
  };

  // 55-65: Stat boxes animate (numbers count up)
  const statProgress = interpolate(frame, [55, 65], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // 70-90: Cursor moves to and clicks "Create Agent" button
  const cursorStartX = 800;
  const cursorStartY = 200;
  const cursorEndX = 720;
  const cursorEndY = 640;

  const cursorX = interpolate(frame, [70, 82], [cursorStartX, cursorEndX], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const cursorY = interpolate(frame, [70, 82], [cursorStartY, cursorEndY], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const cursorOpacity = interpolate(frame, [70, 74, 88, 90], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  // Button click effect (click happens at frame 84)
  const isClicking = frame >= 84 && frame <= 88;
  const buttonScale = isClicking ? 0.96 : 1;
  const buttonBrightness = isClicking ? 0.9 : 1;

  // Click ripple
  const rippleOpacity = interpolate(frame, [84, 90], [0.5, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const rippleScale = interpolate(frame, [84, 90], [0, 1.5], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // 90-99: Overlay begins fading in (transition to next scene)
  const overlayOpacity = interpolate(frame, [90, 99], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Calculate animated stat values
  const getAnimatedValue = (stat: (typeof runStats)[0]) => {
    if (stat.isStatus) return stat.value;
    const numValue = stat.value as number;
    const animated = numValue * statProgress;
    if (stat.decimals) {
      return `${stat.prefix || ''}${animated.toFixed(stat.decimals)}${stat.suffix}`;
    }
    return `${stat.prefix || ''}${Math.round(animated)}${stat.suffix}`;
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        overflow: 'hidden',
        fontFamily: fonts.heading,
      }}
    >
      {/* Sidebar */}
      <Sidebar activeItem="Agents" animationDelay={0} />

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: 256,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          opacity: pageOpacity,
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: colors.textPrimary,
                margin: 0,
                fontFamily: fonts.body,
              }}
            >
              Agents
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Search */}
            <div style={{ position: 'relative', width: 280 }}>
              <span
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textMuted,
                  fontSize: 14,
                  fontFamily: fonts.body,
                }}
              >
                Q
              </span>
              <div
                style={{
                  width: '100%',
                  paddingLeft: 36,
                  paddingRight: 16,
                  paddingTop: 6,
                  paddingBottom: 6,
                  background: '#f1f5f9',
                  borderRadius: 6,
                  fontSize: 14,
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                }}
              >
                Search agents...
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  fontSize: 14,
                  position: 'relative',
                  fontFamily: fonts.body,
                }}
              >
                B
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    background: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid white',
                  }}
                />
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: fonts.body,
                }}
              >
                ?
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            padding: '24px 40px',
          }}
        >
          <div style={{ maxWidth: 800 }}>
            {/* Breadcrumb and Header */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 4,
                  fontFamily: fonts.body,
                }}
              >
                <span>Agents</span>
                <span style={{ color: colors.textMuted }}>{'>'}</span>
                <span style={{ color: colors.textPrimary, fontWeight: 500 }}>Review Agent</span>
              </div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  margin: 0,
                  letterSpacing: '-0.025em',
                  fontFamily: fonts.heading,
                }}
              >
                Review Agent
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  margin: 0,
                  fontFamily: fonts.body,
                }}
              >
                Review your configuration before creating the agent
              </p>
            </div>

            {/* Progress Steps - All 3 complete with checkmarks */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 0',
                marginBottom: 20,
              }}
            >
              {/* Step 1 - Complete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: colors.primary,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.primary,
                    fontFamily: fonts.body,
                  }}
                >
                  Agent Type
                </span>
              </div>

              {/* Connector 1 */}
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: colors.primary,
                  margin: '0 4px',
                  maxWidth: 60,
                }}
              />

              {/* Step 2 - Complete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: colors.primary,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.primary,
                    fontFamily: fonts.body,
                  }}
                >
                  Configuration
                </span>
              </div>

              {/* Connector 2 */}
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: colors.primary,
                  margin: '0 4px',
                  maxWidth: 60,
                }}
              />

              {/* Step 3 - Complete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: colors.primary,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                  }}
                >
                  Review
                </span>
              </div>
            </div>

            {/* ============================================= */}
            {/* SECTION 1: Agent Details */}
            {/* ============================================= */}
            {(() => {
              const anim = getSectionAnim(0);
              return (
                <div
                  style={{
                    background: colors.cardBackground,
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    boxShadow: shadows.sm,
                    padding: 20,
                    marginBottom: 16,
                    opacity: anim.opacity,
                    transform: `translateY(${anim.y}px)`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: colors.primaryBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.primary,
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      A
                    </div>
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: colors.textPrimary,
                        margin: 0,
                        fontFamily: fonts.heading,
                      }}
                    >
                      Agent Details
                    </h2>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 24,
                    }}
                  >
                    {/* Agent Name */}
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: colors.textSecondary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: 4,
                          fontFamily: fonts.body,
                        }}
                      >
                        Agent Name
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: colors.textPrimary,
                          margin: 0,
                          fontFamily: fonts.body,
                        }}
                      >
                        Support Bot v3
                      </p>
                    </div>

                    {/* Agent Type */}
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: colors.textSecondary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: 4,
                          fontFamily: fonts.body,
                        }}
                      >
                        Agent Type
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background: '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563eb',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          C
                        </div>
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: colors.textPrimary,
                            margin: 0,
                            fontFamily: fonts.body,
                          }}
                        >
                          Chat Agent
                        </p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: colors.textSecondary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: 4,
                          fontFamily: fonts.body,
                        }}
                      >
                        Created Date
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: colors.textPrimary,
                          margin: 0,
                          fontFamily: fonts.body,
                        }}
                      >
                        {getTodayDate()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ============================================= */}
            {/* SECTION 2: MCP Servers */}
            {/* ============================================= */}
            {(() => {
              const anim = getSectionAnim(1);
              return (
                <div
                  style={{
                    background: colors.cardBackground,
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    boxShadow: shadows.sm,
                    padding: 20,
                    marginBottom: 16,
                    opacity: anim.opacity,
                    transform: `translateY(${anim.y}px)`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: colors.primaryBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.primary,
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      S
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h2
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: colors.textPrimary,
                          margin: 0,
                          fontFamily: fonts.heading,
                        }}
                      >
                        MCP Servers
                      </h2>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: colors.textSecondary,
                          background: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontFamily: fonts.body,
                        }}
                      >
                        (3 configured)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {mcpServers.map((server) => (
                      <div
                        key={server.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 12px',
                          background: '#f1f5f9',
                          borderRadius: 20,
                          fontSize: 13,
                          fontFamily: fonts.body,
                        }}
                      >
                        <span
                          style={{
                            color: colors.primary,
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        >
                          {server.icon}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: colors.textPrimary,
                          }}
                        >
                          {server.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ============================================= */}
            {/* SECTION 3: Query Configuration */}
            {/* ============================================= */}
            {(() => {
              const anim = getSectionAnim(2);
              return (
                <div
                  style={{
                    background: colors.cardBackground,
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    boxShadow: shadows.sm,
                    padding: 20,
                    marginBottom: 16,
                    opacity: anim.opacity,
                    transform: `translateY(${anim.y}px)`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: '#f3e8ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9333ea',
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      Q
                    </div>
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: colors.textPrimary,
                        margin: 0,
                        fontFamily: fonts.heading,
                      }}
                    >
                      Query Configuration
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* AI-Generated indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: 'linear-gradient(135deg, #9333ea 0%, #135bec 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        AI
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: colors.textPrimary,
                            margin: 0,
                            fontFamily: fonts.body,
                          }}
                        >
                          AI-Generated
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: colors.textSecondary,
                            margin: 0,
                            fontFamily: fonts.body,
                          }}
                        >
                          50 test queries
                        </p>
                      </div>
                    </div>

                    {/* Query type badges */}
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: colors.textSecondary,
                          marginBottom: 6,
                          fontFamily: fonts.body,
                        }}
                      >
                        Query Types
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            background: '#dcfce7',
                            color: '#15803d',
                            fontFamily: fonts.body,
                          }}
                        >
                          Happy Path
                        </span>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            background: '#fef3c7',
                            color: '#b45309',
                            fontFamily: fonts.body,
                          }}
                        >
                          Edge Cases
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ============================================= */}
            {/* SECTION 4: Estimated Run Summary */}
            {/* ============================================= */}
            {(() => {
              const anim = getSectionAnim(3);
              return (
                <div
                  style={{
                    background: colors.cardBackground,
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    boxShadow: shadows.sm,
                    padding: 20,
                    marginBottom: 20,
                    opacity: anim.opacity,
                    transform: `translateY(${anim.y}px)`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: '#dcfce7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#16a34a',
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      R
                    </div>
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: colors.textPrimary,
                        margin: 0,
                        fontFamily: fonts.heading,
                      }}
                    >
                      Estimated Run Summary
                    </h2>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 12,
                    }}
                  >
                    {runStats.map((stat, index) => (
                      <div
                        key={stat.label}
                        style={{
                          padding: 16,
                          background: '#f8fafc',
                          borderRadius: 8,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: colors.textSecondary,
                            marginBottom: 4,
                            fontFamily: fonts.body,
                          }}
                        >
                          {stat.label}
                        </p>
                        {stat.isStatus ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: colors.success,
                              }}
                            />
                            <p
                              style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: colors.success,
                                margin: 0,
                                fontFamily: fonts.body,
                              }}
                            >
                              Ready
                            </p>
                          </div>
                        ) : (
                          <p
                            style={{
                              fontSize: 22,
                              fontWeight: 700,
                              color: colors.textPrimary,
                              margin: 0,
                              fontFamily: fonts.heading,
                            }}
                          >
                            {getAnimatedValue(stat)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 8,
              }}
            >
              {/* Back Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.textSecondary,
                  fontFamily: fonts.body,
                }}
              >
                {'<'} Back
              </div>

              {/* Create Agent Button */}
              <div
                style={{
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  background: colors.primary,
                  color: 'white',
                  boxShadow: shadows.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transform: `scale(${buttonScale})`,
                  filter: `brightness(${buttonBrightness})`,
                  position: 'relative',
                  overflow: 'hidden',
                  fontFamily: fonts.body,
                }}
              >
                {/* Click ripple effect */}
                {frame >= 84 && frame <= 90 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.3)',
                      transform: `translate(-50%, -50%) scale(${rippleScale})`,
                      opacity: rippleOpacity,
                    }}
                  />
                )}
                Create Agent
                <span style={{ fontSize: 16 }}>✓</span>
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
          width: 24,
          height: 24,
          opacity: cursorOpacity,
          pointerEvents: 'none',
          zIndex: 100,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36z"
            fill="#000"
            stroke="#fff"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Transition Overlay (90-99: fading in) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          opacity: overlayOpacity,
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />
    </AbsoluteFill>
  );
};
