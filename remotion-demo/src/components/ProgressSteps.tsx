import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../styles';

interface ProgressStepsProps {
  currentStep: 1 | 2 | 3;
  animationDelay?: number;
}

const steps = [
  { number: 1, label: 'Agent Type' },
  { number: 2, label: 'Configuration' },
  { number: 3, label: 'Review' },
];

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStep,
  animationDelay = 0,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [animationDelay, animationDelay + 12], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const y = interpolate(frame, [animationDelay, animationDelay + 12], [15, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '16px 0',
        marginBottom: 24,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;

        return (
          <React.Fragment key={step.number}>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isCompleted || isActive ? colors.primary : '#f1f5f9',
                  color: isCompleted || isActive ? 'white' : colors.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: fonts.body,
                }}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color:
                    isCompleted || isActive
                      ? isCompleted
                        ? colors.primary
                        : colors.textPrimary
                      : colors.textSecondary,
                  fontFamily: fonts.body,
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: step.number < currentStep ? colors.primary : colors.border,
                  margin: '0 8px',
                  maxWidth: 80,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
