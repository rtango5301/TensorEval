import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { colors, shadows, fonts } from '../styles';

// Celebration particle configuration
const particles = [
  { x: -60, y: -40, rotation: 45, delay: 0, color: '#facc15' },
  { x: 60, y: -50, rotation: -30, delay: 2, color: '#22c55e' },
  { x: -70, y: 20, rotation: 60, delay: 4, color: '#3b82f6' },
  { x: 70, y: 10, rotation: -45, delay: 3, color: '#ec4899' },
  { x: -40, y: -60, rotation: 90, delay: 1, color: '#f97316' },
  { x: 40, y: -65, rotation: -60, delay: 5, color: '#8b5cf6' },
  { x: 0, y: -70, rotation: 0, delay: 2, color: '#14b8a6' },
  { x: -80, y: -10, rotation: 30, delay: 4, color: '#f43f5e' },
  { x: 80, y: -20, rotation: -20, delay: 1, color: '#eab308' },
];

const VIDEO_FPS = 30;

export const SuccessScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Animation timeline:
  // 0-10: Overlay fades in with blur
  // 10-30: Modal scales in (spring animation)
  // 30-45: Checkmark animates with celebration particles
  // 45-60: Text fades in
  // 60-75: Buttons appear
  // 75-99: Hold on success state

  // Overlay fade in (0-10)
  const overlayOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const overlayBlur = interpolate(frame, [0, 10], [0, 8], {
    extrapolateRight: 'clamp',
  });

  // Modal spring animation (10-30)
  const modalSpring = spring({
    frame: frame - 10,
    fps: VIDEO_FPS,
    config: { damping: 12, stiffness: 100 },
  });

  const modalScale = interpolate(modalSpring, [0, 1], [0.8, 1]);
  const modalOpacity = interpolate(frame, [10, 18], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Checkmark animation (30-45)
  const checkmarkScale = spring({
    frame: frame - 30,
    fps: VIDEO_FPS,
    config: { damping: 8, stiffness: 150 },
  });

  const checkmarkOpacity = interpolate(frame, [30, 35], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Checkmark stroke animation
  const checkmarkStroke = interpolate(frame, [32, 42], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Celebration particles (30-45)
  const getParticleStyle = (particle: (typeof particles)[0]) => {
    const particleStart = 30 + particle.delay;
    const particleOpacity = interpolate(
      frame,
      [particleStart, particleStart + 5, particleStart + 12, particleStart + 15],
      [0, 1, 1, 0],
      { extrapolateRight: 'clamp' }
    );
    const particleScale = interpolate(frame, [particleStart, particleStart + 8], [0, 1], {
      extrapolateRight: 'clamp',
    });
    const particleY = interpolate(
      frame,
      [particleStart, particleStart + 15],
      [0, particle.y * 1.5],
      { extrapolateRight: 'clamp' }
    );
    const particleX = interpolate(
      frame,
      [particleStart, particleStart + 15],
      [0, particle.x * 1.2],
      { extrapolateRight: 'clamp' }
    );
    const particleRotation = interpolate(
      frame,
      [particleStart, particleStart + 15],
      [0, particle.rotation],
      { extrapolateRight: 'clamp' }
    );

    return {
      opacity: particleOpacity,
      transform: `translate(${particleX}px, ${particleY}px) scale(${particleScale}) rotate(${particleRotation}deg)`,
    };
  };

  // Text fade in (45-60)
  const titleOpacity = interpolate(frame, [45, 52], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [45, 52], [15, 0], {
    extrapolateRight: 'clamp',
  });

  const subtitleOpacity = interpolate(frame, [48, 55], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const subtitleY = interpolate(frame, [48, 55], [10, 0], {
    extrapolateRight: 'clamp',
  });

  const agentNameOpacity = interpolate(frame, [52, 60], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const agentNameY = interpolate(frame, [52, 60], [10, 0], {
    extrapolateRight: 'clamp',
  });

  // Buttons appear (60-75)
  const primaryButtonOpacity = interpolate(frame, [60, 68], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const primaryButtonY = interpolate(frame, [60, 68], [20, 0], {
    extrapolateRight: 'clamp',
  });

  const secondaryButtonsOpacity = interpolate(frame, [66, 75], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const secondaryButtonsY = interpolate(frame, [66, 75], [15, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        fontFamily: fonts.heading,
      }}
    >
      {/* Background content (dimmed) - simulating the review page behind */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.3,
          filter: `blur(${overlayBlur}px)`,
        }}
      >
        {/* Simplified background representing the review page */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 256,
            height: '100%',
            background: colors.cardBackground,
            borderRight: `1px solid ${colors.border}`,
          }}
        />
        <div
          style={{
            marginLeft: 256,
            padding: 40,
          }}
        >
          <div
            style={{
              width: 600,
              height: 400,
              background: colors.cardBackground,
              borderRadius: 12,
              marginTop: 80,
            }}
          />
        </div>
      </div>

      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: `blur(${overlayBlur}px)`,
          opacity: overlayOpacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Success Modal */}
        <div
          style={{
            background: colors.cardBackground,
            borderRadius: 16,
            boxShadow: shadows.xl,
            padding: 32,
            width: 400,
            opacity: modalOpacity,
            transform: `scale(${modalScale})`,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Celebration Icon with checkmark */}
            <div
              style={{
                position: 'relative',
                marginBottom: 24,
                width: 80,
                height: 80,
              }}
            >
              {/* Main checkmark circle */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4ade80 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                  opacity: checkmarkOpacity,
                  transform: `scale(${checkmarkScale})`,
                }}
              >
                {/* Animated checkmark SVG */}
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ overflow: 'visible' }}
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="24"
                    strokeDashoffset={24 - checkmarkStroke * 24}
                  />
                </svg>
              </div>

              {/* Celebration badge */}
              <div
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#facc15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(250, 204, 21, 0.4)',
                  opacity: checkmarkOpacity,
                  transform: `scale(${checkmarkScale})`,
                }}
              >
                <span style={{ fontSize: 14 }}>🎉</span>
              </div>

              {/* Celebration particles */}
              {particles.map((particle, index) => {
                const particleStyle = getParticleStyle(particle);
                return (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 8,
                      height: 8,
                      marginLeft: -4,
                      marginTop: -4,
                      borderRadius: index % 2 === 0 ? '50%' : 2,
                      background: particle.color,
                      ...particleStyle,
                    }}
                  />
                );
              })}
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: colors.textPrimary,
                margin: 0,
                marginBottom: 8,
                opacity: titleOpacity,
                transform: `translateY(${titleY}px)`,
              }}
            >
              Agent Created Successfully!
            </h3>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                margin: 0,
                marginBottom: 4,
                opacity: subtitleOpacity,
                transform: `translateY(${subtitleY}px)`,
              }}
            >
              Your new agent is ready to go
            </p>

            {/* Agent Name */}
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: colors.primary,
                margin: 0,
                marginBottom: 32,
                opacity: agentNameOpacity,
                transform: `translateY(${agentNameY}px)`,
              }}
            >
              Support Bot v3
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                width: '100%',
              }}
            >
              {/* Primary Button - Run First Evaluation */}
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  boxShadow: shadows.primary,
                  cursor: 'pointer',
                  opacity: primaryButtonOpacity,
                  transform: `translateY(${primaryButtonY}px)`,
                  fontFamily: fonts.heading,
                }}
              >
                <span style={{ fontSize: 18 }}>▶</span>
                Run First Evaluation
              </button>

              {/* Secondary Buttons Row */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  opacity: secondaryButtonsOpacity,
                  transform: `translateY(${secondaryButtonsY}px)`,
                }}
              >
                {/* View Agent Details */}
                <button
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: 14,
                    background: colors.cardBackground,
                    color: colors.textSecondary,
                    border: `1px solid ${colors.border}`,
                    cursor: 'pointer',
                    fontFamily: fonts.heading,
                  }}
                >
                  <span style={{ fontSize: 14 }}>🤖</span>
                  View Agent Details
                </button>

                {/* Go to Dashboard */}
                <button
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: 14,
                    background: colors.cardBackground,
                    color: colors.textSecondary,
                    border: `1px solid ${colors.border}`,
                    cursor: 'pointer',
                    fontFamily: fonts.heading,
                  }}
                >
                  <span style={{ fontSize: 14 }}>▦</span>
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
