import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoVariant = 'default' | 'light' | 'dashboard';
type LogoSize = 'sm' | 'md';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  showText?: boolean;
  lockup?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { mark: 32, text: 'text-lg', lockup: { width: 154, height: 40 } },
  md: { mark: 40, text: 'text-xl', lockup: { width: 193, height: 50 } },
};

export function Logo({
  variant = 'default',
  size = 'sm',
  showText = true,
  lockup = false,
  className,
}: LogoProps) {
  const config = sizeConfig[size];

  if (lockup) {
    return (
      <Image
        src="/brand/tensoreval-lockup.svg"
        alt="TensorEval — CI/CD for Agentic Workflows"
        width={config.lockup.width}
        height={config.lockup.height}
        className={cn('shrink-0', className)}
      />
    );
  }

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Image
        src="/brand/tensoreval-mark.svg"
        alt={showText ? '' : 'TensorEval'}
        width={config.mark}
        height={config.mark}
        className="shrink-0"
      />
      {showText && (
        <span
          className={cn(
            'font-display font-bold tracking-[-0.03em]',
            config.text,
            variant === 'light' ? 'text-white' : 'text-[var(--on-surface)]'
          )}
        >
          TensorEval
        </span>
      )}
    </div>
  );
}
