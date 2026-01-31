import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { colors, fonts, shadows } from '../styles';
import { Sidebar } from '../components/Sidebar';
import { ProgressSteps } from '../components/ProgressSteps';

// Added MCPs that will show as chips
const addedMcps = [
  { id: 'gmail', name: 'Gmail', icon: 'M' },
  { id: 'slack', name: 'Slack', icon: 'S' },
  { id: 'github', name: 'GitHub', icon: 'G' },
];

// Query categories
const queryCategories = [
  { id: 'happy_path', name: 'Happy Path', icon: ':)', color: '#22c55e', checked: true },
  { id: 'edge_cases', name: 'Edge Cases', icon: '!', color: '#f59e0b', checked: true },
  { id: 'adversarial', name: 'Adversarial', icon: 'X', color: '#ef4444', checked: false },
  { id: 'domain_specific', name: 'Domain-Specific', icon: '=', color: '#135bec', checked: false },
];

export const ConfigurePageScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Animation timeline (100 frames total)
  // 0-20: Page fade in
  const pageOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // 20-35: MCP section with added chips animate
  const mcpSectionOpacity = interpolate(frame, [20, 30], [0, 1], { extrapolateRight: 'clamp' });
  const mcpSectionY = interpolate(frame, [20, 30], [20, 0], { extrapolateRight: 'clamp' });

  // Staggered chip animations
  const chip1Opacity = interpolate(frame, [25, 30], [0, 1], { extrapolateRight: 'clamp' });
  const chip1Scale = interpolate(frame, [25, 30], [0.8, 1], { extrapolateRight: 'clamp' });
  const chip2Opacity = interpolate(frame, [28, 33], [0, 1], { extrapolateRight: 'clamp' });
  const chip2Scale = interpolate(frame, [28, 33], [0.8, 1], { extrapolateRight: 'clamp' });
  const chip3Opacity = interpolate(frame, [31, 36], [0, 1], { extrapolateRight: 'clamp' });
  const chip3Scale = interpolate(frame, [31, 36], [0.8, 1], { extrapolateRight: 'clamp' });

  const chipAnimations = [
    { opacity: chip1Opacity, scale: chip1Scale },
    { opacity: chip2Opacity, scale: chip2Scale },
    { opacity: chip3Opacity, scale: chip3Scale },
  ];

  // 35-55: Query section with AI config selected
  const querySectionOpacity = interpolate(frame, [35, 45], [0, 1], { extrapolateRight: 'clamp' });
  const querySectionY = interpolate(frame, [35, 45], [20, 0], { extrapolateRight: 'clamp' });

  // AI Generate highlight animation
  const aiHighlightOpacity = interpolate(frame, [45, 55], [0, 1], { extrapolateRight: 'clamp' });
  const aiHighlightScale = interpolate(frame, [45, 55], [0.95, 1], { extrapolateRight: 'clamp' });

  // 55-70: Query count shows "50", types checked
  const queryCountOpacity = interpolate(frame, [55, 62], [0, 1], { extrapolateRight: 'clamp' });
  const queryTypesOpacity = interpolate(frame, [60, 70], [0, 1], { extrapolateRight: 'clamp' });

  // 75-95: Cursor clicks "Continue to Review" button
  const cursorOpacity = interpolate(frame, [75, 80, 92, 95], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const cursorX = interpolate(frame, [75, 88], [600, 820], { extrapolateRight: 'clamp' });
  const cursorY = interpolate(frame, [75, 88], [300, 585], { extrapolateRight: 'clamp' });

  // Button click animation
  const buttonScale = interpolate(frame, [88, 91, 95], [1, 0.96, 1], { extrapolateRight: 'clamp' });
  const buttonGlow = interpolate(frame, [88, 91, 95], [0, 1, 0], { extrapolateRight: 'clamp' });

  // Action buttons fade in
  const actionBarOpacity = interpolate(frame, [50, 60], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, overflow: 'hidden' }}>
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
        {/* Header Bar */}
        <div
          style={{
            height: 56,
            background: colors.cardBackground,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: colors.surfaceLight,
                borderRadius: 6,
                width: 240,
              }}
            >
              <span style={{ fontSize: 14, color: colors.textMuted, fontFamily: fonts.body }}>
                Search agents...
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '24px 40px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 800 }}>
            {/* Breadcrumb */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body }}>
                Agents
              </span>
              <span style={{ fontSize: 14, color: colors.textMuted }}>&gt;</span>
              <span
                style={{
                  fontSize: 14,
                  color: colors.textPrimary,
                  fontWeight: 500,
                  fontFamily: fonts.body,
                }}
              >
                Configure Agent
              </span>
            </div>

            {/* Page Title */}
            <div style={{ marginBottom: 6 }}>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  margin: 0,
                  fontFamily: fonts.heading,
                  letterSpacing: '-0.02em',
                }}
              >
                Configure Agent
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 4,
                  fontFamily: fonts.body,
                }}
              >
                Set up MCP connections and evaluation parameters for Support Bot v2.4
              </p>
            </div>

            {/* Progress Steps */}
            <ProgressSteps currentStep={2} animationDelay={5} />

            {/* MCP Servers Section */}
            <div
              style={{
                background: colors.cardBackground,
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                padding: 20,
                marginBottom: 20,
                boxShadow: shadows.sm,
                opacity: mcpSectionOpacity,
                transform: `translateY(${mcpSectionY}px)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(19, 91, 236, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: 18, color: colors.primary, fontWeight: 700 }}>M</span>
                </div>
                <div style={{ flex: 1 }}>
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
                  <p
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      margin: 0,
                      fontFamily: fonts.body,
                    }}
                  >
                    Connect your agent to MCP servers for tools and integrations
                  </p>
                </div>
              </div>

              {/* Added MCPs Chips */}
              <div
                style={{
                  padding: 16,
                  background: colors.surfaceLight,
                  borderRadius: 8,
                  marginBottom: 16,
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
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: colors.textSecondary,
                      fontFamily: fonts.body,
                    }}
                  >
                    Added MCPs
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: colors.textMuted,
                      background: 'white',
                      padding: '2px 8px',
                      borderRadius: 12,
                      border: `1px solid ${colors.border}`,
                      fontFamily: fonts.body,
                    }}
                  >
                    3 configured
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {addedMcps.map((mcp, index) => (
                    <div
                      key={mcp.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        background: 'white',
                        borderRadius: 20,
                        border: `1px solid ${colors.border}`,
                        opacity: chipAnimations[index].opacity,
                        transform: `scale(${chipAnimations[index].scale})`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          color: colors.primary,
                          fontWeight: 600,
                        }}
                      >
                        {mcp.icon}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: colors.textPrimary,
                          fontFamily: fonts.body,
                        }}
                      >
                        {mcp.name}
                      </span>
                      <span style={{ fontSize: 14, color: colors.textMuted, cursor: 'pointer' }}>
                        x
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Browse Marketplace Button */}
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: fonts.body,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16 }}>+</span>
                Browse Marketplace
              </button>
            </div>

            {/* Query Configuration Section */}
            <div
              style={{
                background: colors.cardBackground,
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                padding: 20,
                marginBottom: 20,
                boxShadow: shadows.sm,
                opacity: querySectionOpacity,
                transform: `translateY(${querySectionY}px)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(147, 51, 234, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: 18, color: '#9333ea', fontWeight: 700 }}>Q</span>
                </div>
                <div>
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
                  <p
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      margin: 0,
                      fontFamily: fonts.body,
                    }}
                  >
                    Define test queries for agent evaluation
                  </p>
                </div>
              </div>

              {/* Upload and AI Generate Options */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {/* Upload Option (simplified) */}
                <div
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    border: `2px dashed ${colors.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    opacity: 0.6,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: colors.surfaceLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 20, color: colors.textMuted }}>U</span>
                  </div>
                  <h3
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: colors.textPrimary,
                      margin: 0,
                      fontFamily: fonts.body,
                    }}
                  >
                    Upload Dataset
                  </h3>
                  <p
                    style={{
                      fontSize: 11,
                      color: colors.textSecondary,
                      margin: '4px 0',
                      fontFamily: fonts.body,
                    }}
                  >
                    JSONL or CSV file
                  </p>
                </div>

                {/* AI Generate Option (highlighted/selected) */}
                <div
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    border: `2px solid ${colors.primary}`,
                    background:
                      'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(19, 91, 236, 0.08) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    opacity: aiHighlightOpacity,
                    transform: `scale(${aiHighlightScale})`,
                    boxShadow: '0 4px 12px rgba(19, 91, 236, 0.15)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #9333ea 0%, #135bec 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 20, color: 'white' }}>*</span>
                  </div>
                  <h3
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: colors.textPrimary,
                      margin: 0,
                      fontFamily: fonts.body,
                    }}
                  >
                    AI Generate
                  </h3>
                  <p
                    style={{
                      fontSize: 11,
                      color: colors.textSecondary,
                      margin: '4px 0',
                      fontFamily: fonts.body,
                    }}
                  >
                    Auto-generate queries
                  </p>
                  <div
                    style={{
                      marginTop: 4,
                      padding: '2px 8px',
                      background: colors.primary,
                      color: 'white',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    SELECTED
                  </div>
                </div>
              </div>

              {/* Query Count and Types Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr',
                  gap: 16,
                  opacity: queryCountOpacity,
                }}
              >
                {/* Query Count */}
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: colors.textPrimary,
                      display: 'block',
                      marginBottom: 8,
                      fontFamily: fonts.body,
                    }}
                  >
                    Total Queries
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 16px',
                        background: colors.surfaceLight,
                        borderRadius: 8,
                        border: `2px solid ${colors.primary}`,
                        fontSize: 24,
                        fontWeight: 700,
                        color: colors.textPrimary,
                        fontFamily: fonts.body,
                        textAlign: 'center',
                        width: '100%',
                      }}
                    >
                      50
                    </div>
                  </div>
                </div>

                {/* Query Types */}
                <div style={{ opacity: queryTypesOpacity }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: colors.textPrimary,
                      display: 'block',
                      marginBottom: 8,
                      fontFamily: fonts.body,
                    }}
                  >
                    Query Types
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                    {queryCategories.map((category) => (
                      <div
                        key={category.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 10px',
                          borderRadius: 6,
                          border: `2px solid ${category.checked ? colors.primary : colors.border}`,
                          background: category.checked ? 'rgba(19, 91, 236, 0.05)' : 'transparent',
                        }}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            border: `2px solid ${category.checked ? colors.primary : colors.border}`,
                            background: category.checked ? colors.primary : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {category.checked && 'v'}
                        </div>
                        <span style={{ fontSize: 12, color: category.color, fontWeight: 600 }}>
                          {category.icon}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: colors.textSecondary,
                            fontFamily: fonts.body,
                          }}
                        >
                          {category.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 8,
                opacity: actionBarOpacity,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.textSecondary,
                  cursor: 'pointer',
                  fontFamily: fonts.body,
                }}
              >
                <span style={{ fontSize: 16 }}>&lt;</span>
                Back
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 8,
                  background: colors.primary,
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: `0 4px 14px 0 rgba(19, 91, 236, ${0.3 + buttonGlow * 0.3})`,
                  transform: `scale(${buttonScale})`,
                  fontFamily: fonts.body,
                }}
              >
                Continue to Review
                <span style={{ fontSize: 16 }}>&gt;</span>
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
    </AbsoluteFill>
  );
};
