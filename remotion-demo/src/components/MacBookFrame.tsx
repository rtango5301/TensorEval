import React from 'react';
import { AbsoluteFill } from 'remotion';

interface MacBookFrameProps {
  children: React.ReactNode;
  title?: string;
  width?: number;
  height?: number;
}

export const MacBookFrame: React.FC<MacBookFrameProps> = ({
  children,
  title = 'tensoreval.app',
  width = 1200,
  height = 800,
}) => {
  const titleBarHeight = 36;
  const borderRadius = 12;
  const buttonSize = 12;
  const buttonGap = 8;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            height: titleBarHeight,
            backgroundColor: '#3a3a3c',
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            position: 'relative',
          }}
        >
          {/* Window Control Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: buttonGap,
            }}
          >
            {/* Close Button (Red) */}
            <div
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '50%',
                backgroundColor: '#ff5f57',
                boxShadow:
                  'inset 0 -1px 1px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
              }}
            />
            {/* Minimize Button (Yellow) */}
            <div
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '50%',
                backgroundColor: '#febc2e',
                boxShadow:
                  'inset 0 -1px 1px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
              }}
            />
            {/* Maximize Button (Green) */}
            <div
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: '50%',
                backgroundColor: '#28c840',
                boxShadow:
                  'inset 0 -1px 1px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
              }}
            />
          </div>

          {/* Centered Title/URL */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#a1a1a1',
              fontSize: 13,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 400,
              letterSpacing: '0.02em',
            }}
          >
            {title}
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#1a1a1a',
            borderLeft: '1px solid #2d2d2d',
            borderRight: '1px solid #2d2d2d',
            borderBottom: '1px solid #2d2d2d',
            borderBottomLeftRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
