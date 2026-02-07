import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { TeaserSlide } from '@/types/company';
import { Shield, Zap, TrendingUp } from 'lucide-react';

interface InvestmentHighlightsSlideProps {
  slide: TeaserSlide;
  futurePlans: string[];
}

const columns = [
  {
    title: 'High Entry Barriers',
    icon: Shield,
    gradient: 'from-[hsl(var(--kelp-indigo))] to-[hsl(var(--kelp-indigo-light))]',
  },
  {
    title: 'Operational Excellence',
    icon: Zap,
    gradient: 'from-[hsl(var(--kelp-pink))] to-[hsl(var(--kelp-orange))]',
  },
  {
    title: 'Market Opportunity',
    icon: TrendingUp,
    gradient: 'from-emerald-600 to-teal-500',
  },
];

export function InvestmentHighlightsSlide({ slide, futurePlans }: InvestmentHighlightsSlideProps) {
  const bullets = slide.content.bullets;
  const chunkedBullets = [
    bullets.slice(0, 2),
    bullets.slice(2, 4),
    bullets.slice(4, 6),
  ];

  return (
    <div className="aspect-[16/9] bg-card rounded-xl overflow-hidden slide-shadow flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <SlideHeader title="Investment Thesis" />

        <div className="flex-1 mt-6">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">
            {slide.content.headline || 'Key Investment Highlights'}
          </h2>

          {/* Three Column Layout */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col">
                <div className={`flex items-center gap-2 mb-3 p-3 rounded-lg bg-gradient-to-r ${column.gradient}`}>
                  <column.icon className="w-5 h-5 text-white" />
                  <span className="text-sm font-semibold text-white">{column.title}</span>
                </div>
                <ul className="space-y-2 flex-1">
                  {chunkedBullets[colIndex]?.map((bullet, index) => (
                    <li key={index} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Future Plans / Growth Narrative */}
          {futurePlans.length > 0 && (
            <div className="bg-muted/40 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Growth Trajectory</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {futurePlans.slice(0, 4).map((plan, index) => (
                  <p key={index} className="text-[11px] text-muted-foreground flex gap-2">
                    <span className="text-[hsl(var(--kelp-pink))]">→</span>
                    <span>{plan}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <SlideFooter pageNumber={3} />
      </div>
    </div>
  );
}
