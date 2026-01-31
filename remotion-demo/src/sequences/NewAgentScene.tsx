import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { colors, fonts, shadows } from '../styles';
import { Sidebar } from '../components/Sidebar';
import { ProgressSteps } from '../components/ProgressSteps';

// Agent types from src/app/agents/new/page.tsx
const agentTypes = [
  {
    id: 'chat',
    name: 'Chat Agent',
    description: 'Conversational AI for customer support, FAQs, and help desk.',
    icon: 'C',
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
  },
  {
    id: 'data',
    name: 'Data Agent',
    description: 'Analyze, process, and transform structured and unstructured data.',
    icon: 'D',
    iconBg: '#faf5ff',
    iconColor: '#9333ea',
  },
  {
    id: 'browser',
    name: 'Browser Agent',
    description: 'Automate web browsing, scraping, and form submissions.',
    icon: 'B',
    iconBg: '#fff7ed',
    iconColor: '#ea580c',
  },
  {
    id: 'content',
    name: 'Content Agent',
    description: 'Generate, edit, and optimize written content at scale.',
    icon: 'E',
    iconBg: '#fdf2f8',
    iconColor: '#db2777',
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    description: 'Build a custom agent with your own tools and capabilities.',
    icon: 'X',
    iconBg: '#f1f5f9',
    iconColor: '#475569',
  },
];

const VIDEO_FPS = 30;

export const NewAgentScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Animation timings
  const pageOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  const headerOpacity = interpolate(frame, [5, 18], [0, 1], { extrapolateRight: 'clamp' });
  const headerY = interpolate(frame, [5, 18], [15, 0], { extrapolateRight: 'clamp' });

  // Card fade in
  const cardOpacity = interpolate(frame, [15, 28], [0, 1], { extrapolateRight: 'clamp' });
  const cardY = interpolate(frame, [15, 28], [20, 0], { extrapolateRight: 'clamp' });

  // Name input typing animation
  const nameText = 'Support Bot v3';
  const typedNameLength = Math.floor(
    interpolate(frame, [30, 50], [0, nameText.length], { extrapolateRight: 'clamp' })
  );
  const typedName = nameText.slice(0, typedNameLength);
  const showCursor = frame >= 30 && frame <= 55 && Math.floor(frame / 8) % 2 === 0;

  // Type cards stagger animation
  const getTypeCardAnim = (index: number) => {
    const delay = 50 + index * 5;
    return {
      opacity: interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateRight: 'clamp' }),
      scale: spring({
        frame: frame - delay,
        fps: VIDEO_FPS,
        config: { damping: 15, stiffness: 120 },
      }),
      y: interpolate(frame, [delay, delay + 12], [20, 0], { extrapolateRight: 'clamp' }),
    };
  };

  // Chat Agent selection highlight
  const chatSelected = frame >= 75;
  const chatSelectScale = interpolate(frame, [75, 78, 81], [1, 0.98, 1], {
    extrapolateRight: 'clamp',
  });

  // Cursor animation
  const cursorX = interpolate(frame, [70, 80, 85, 95], [500, 360, 360, 850], {
    extrapolateRight: 'clamp',
  });
  const cursorY = interpolate(frame, [70, 80, 85, 95], [280, 358, 358, 525], {
    extrapolateRight: 'clamp',
  });
  const cursorOpacity = interpolate(frame, [70, 75, 95, 100], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  // Continue button animation
  const buttonScale = interpolate(frame, [92, 95, 98], [1, 0.96, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        fontFamily: fonts.heading,
        overflow: 'hidden',
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
                width: 200,
              }}
            >
              <span style={{ fontSize: 14, color: colors.textMuted }}>🔍</span>
              <span style={{ fontSize: 14, color: colors.textMuted, fontFamily: fonts.body }}>
                Search agents...
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
        <div style={{ flex: 1, padding: '24px 40px', overflow: 'hidden' }}>
          <div style={{ maxWidth: 680 }}>
            {/* Breadcrumb */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
                opacity: headerOpacity,
                transform: `translateY(${headerY}px)`,
              }}
            >
              <span style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body }}>
                Agents
              </span>
              <span style={{ fontSize: 14, color: colors.textMuted, fontFamily: fonts.body }}>
                &gt;
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: colors.textPrimary,
                  fontWeight: 500,
                  fontFamily: fonts.body,
                }}
              >
                Create New Agent
              </span>
            </div>

            {/* Page Title */}
            <div
              style={{
                marginBottom: 6,
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
                  letterSpacing: '-0.02em',
                }}
              >
                Create New Agent
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 4,
                  fontFamily: fonts.body,
                }}
              >
                Configure your AI agent in just a few steps.
              </p>
            </div>

            {/* Progress Steps */}
            <ProgressSteps currentStep={1} animationDelay={10} />

            {/* Form Card */}
            <div
              style={{
                background: colors.cardBackground,
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                padding: 24,
                boxShadow: shadows.sm,
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
              }}
            >
              {/* Agent Name Input */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    marginBottom: 8,
                    fontFamily: fonts.body,
                  }}
                >
                  Agent Name
                </label>
                <div
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: frame >= 30 ? colors.cardBackground : '#f8fafc',
                    border: `1px solid ${frame >= 30 ? colors.primary : colors.border}`,
                    borderRadius: 8,
                    fontSize: 14,
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                    boxShadow: frame >= 30 ? `0 0 0 3px rgba(19, 91, 236, 0.1)` : 'none',
                  }}
                >
                  {typedName || (
                    <span style={{ color: colors.textMuted }}>
                      e.g., Support Bot, Data Analyst...
                    </span>
                  )}
                  {showCursor && <span style={{ color: colors.primary, fontWeight: 400 }}>|</span>}
                </div>
              </div>

              {/* Agent Type Selection */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    marginBottom: 12,
                    fontFamily: fonts.body,
                  }}
                >
                  Select Agent Type
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 12,
                  }}
                >
                  {agentTypes.slice(0, 4).map((type, index) => {
                    const anim = getTypeCardAnim(index);
                    const isChat = type.id === 'chat';
                    const isSelected = isChat && chatSelected;

                    return (
                      <div
                        key={type.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: 14,
                          borderRadius: 10,
                          border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                          background: isSelected
                            ? 'rgba(19, 91, 236, 0.05)'
                            : colors.cardBackground,
                          opacity: anim.opacity,
                          transform: `translateY(${anim.y}px) scale(${isChat ? chatSelectScale * Math.max(0.9, anim.scale) : Math.max(0.9, anim.scale)})`,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: type.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: type.iconColor,
                            fontSize: 14,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {type.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: colors.textPrimary,
                              margin: 0,
                              fontFamily: fonts.body,
                            }}
                          >
                            {type.name}
                          </h3>
                          <p
                            style={{
                              fontSize: 12,
                              color: colors.textSecondary,
                              margin: 0,
                              marginTop: 2,
                              fontFamily: fonts.body,
                              lineHeight: 1.4,
                            }}
                          >
                            {type.description}
                          </p>
                        </div>
                        {isSelected && (
                          <span
                            style={{
                              color: colors.primary,
                              fontSize: 18,
                              fontWeight: 700,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: colors.textSecondary,
                    fontFamily: fonts.body,
                  }}
                >
                  Cancel
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    borderRadius: 8,
                    background: chatSelected ? colors.primary : '#e2e8f0',
                    color: chatSelected ? 'white' : colors.textMuted,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: fonts.body,
                    boxShadow: chatSelected ? shadows.primary : 'none',
                    transform: `scale(${buttonScale})`,
                  }}
                >
                  Continue
                  <span style={{ fontSize: 16 }}>&gt;</span>
                </div>
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
