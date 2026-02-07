import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { ProcessingState } from '@/types/company';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  state: ProcessingState;
}

const steps = [
  { key: 'parsing', label: 'Parsing File' },
  { key: 'detecting_sector', label: 'Detecting Sector' },
  { key: 'extracting', label: 'Extracting Content' },
  { key: 'generating', label: 'Generating Teaser' },
];

export function ProcessingStatus({ state }: ProcessingStatusProps) {
  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.key === state.status);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-xl mx-auto py-8">
      <div className="mb-6">
        <Progress value={state.progress} className="h-2" />
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isComplete = currentIndex > index || state.status === 'complete';
          const isCurrent = currentIndex === index;
          const isPending = currentIndex < index && state.status !== 'complete';

          return (
            <div
              key={step.key}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                isCurrent && "bg-muted",
                isComplete && "opacity-70"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-[hsl(var(--kelp-pink))] animate-spin shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
              )}
              <span className={cn(
                "text-sm font-medium",
                isPending && "text-muted-foreground/60",
                isCurrent && "kelp-gradient-text"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {state.message}
      </p>
    </div>
  );
}
