import { cn } from '@/lib/utils';

interface KelpLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function KelpLogo({ className, size = 'md' }: KelpLogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className={cn(
          "font-bold tracking-tight",
          sizes[size]
        )}>
          <span className="text-primary">kelp</span>
          <span className="kelp-gradient-text">.</span>
        </div>
      </div>
    </div>
  );
}
