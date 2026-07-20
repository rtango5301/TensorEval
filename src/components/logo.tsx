import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoVariant = 'default' | 'light' | 'dashboard';
type LogoSize = 'sm' | 'md';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { mark: 32, text: 'text-lg' },
  md: { mark: 40, text: 'text-xl' },
};

export function Logo({ variant = 'default', size = 'sm', showText = true, className }: LogoProps) {
  const config = sizeConfig[size];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Image
        src="/brand/tensoreval-mark.svg"
        alt=""
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
