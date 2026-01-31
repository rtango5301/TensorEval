import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../styles';

// Navigation items matching src/app/agents/layout.tsx
const navItems = [
  { label: 'Dashboard', icon: 'D', active: false },
  { label: 'Agents', icon: 'A', active: true },
  { label: 'Evaluations', icon: 'E', active: false },
  { label: 'Reports', icon: 'R', active: false },
];

const secondaryNavItems = [
  { label: 'Settings', icon: 'S' },
  { label: 'API Keys', icon: 'K' },
];

interface SidebarProps {
  activeItem?: 'Dashboard' | 'Agents' | 'Evaluations' | 'Reports';
  animationDelay?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'Agents', animationDelay = 0 }) => {
  const frame = useCurrentFrame();

  // Animation
  const sidebarX = interpolate(frame, [animationDelay, animationDelay + 20], [-256, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const sidebarOpacity = interpolate(frame, [animationDelay, animationDelay + 15], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 256,
        height: '100%',
        background: colors.cardBackground,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        transform: `translateX(${sidebarX}px)`,
        opacity: sidebarOpacity,
      }}
    >
      {/* Logo - matching src/app/agents/layout.tsx */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 32,
          paddingLeft: 8,
          marginTop: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28, color: colors.primary }}>⚡</span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: colors.textPrimary,
              fontFamily: fonts.heading,
              letterSpacing: '-0.025em',
            }}
          >
            TensorEval
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            color: colors.textSecondary,
            fontFamily: fonts.body,
            fontWeight: 500,
            marginLeft: 36,
          }}
        >
          Admin Console
        </span>
      </div>

      {/* Primary Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = item.label === activeItem;
          return (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                background: isActive ? 'rgba(19, 91, 236, 0.1)' : 'transparent',
                color: isActive ? colors.primary : '#475569',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                fontFamily: fonts.body,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </div>
          );
        })}

        {/* Divider */}
        <div style={{ height: 1, background: colors.border, margin: '8px 0' }} />

        {/* Secondary Navigation */}
        {secondaryNavItems.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 8,
              color: '#475569',
              fontWeight: 500,
              fontSize: 14,
              fontFamily: fonts.body,
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {item.icon}
            </span>
            {item.label}
          </div>
        ))}
      </nav>

      {/* User Profile - matching src/app/agents/layout.tsx */}
      <div
        style={{
          marginTop: 'auto',
          padding: '16px 8px',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: 'white',
          }}
        >
          AM
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            Alex Morgan
          </span>
          <span
            style={{
              fontSize: 12,
              color: colors.textSecondary,
              fontFamily: fonts.body,
            }}
          >
            Admin
          </span>
        </div>
      </div>
    </div>
  );
};
