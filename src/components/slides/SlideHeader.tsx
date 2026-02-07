import { KelpLogo } from '@/components/KelpLogo';

interface SlideHeaderProps {
  title?: string;
}

export function SlideHeader({ title }: SlideHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-border/50">
      <KelpLogo size="sm" />
      {title && (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
      )}
    </div>
  );
}
