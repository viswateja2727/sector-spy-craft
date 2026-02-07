import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { TeaserSlide } from '@/types/company';
import { Factory, Cpu, ShoppingBag, Truck, Pill, Clapperboard } from 'lucide-react';

interface BusinessProfileSlideProps {
  slide: TeaserSlide;
  sector: string;
}

const sectorIcons: Record<string, React.ReactNode> = {
  'Manufacturing': <Factory className="w-full h-full" />,
  'Tech/Electronics': <Cpu className="w-full h-full" />,
  'Consumer/D2C': <ShoppingBag className="w-full h-full" />,
  'Logistics': <Truck className="w-full h-full" />,
  'Pharma': <Pill className="w-full h-full" />,
  'Entertainment': <Clapperboard className="w-full h-full" />,
};

const sectorGradients: Record<string, string> = {
  'Manufacturing': 'from-slate-700 via-zinc-600 to-slate-800',
  'Tech/Electronics': 'from-blue-900 via-indigo-800 to-purple-900',
  'Consumer/D2C': 'from-rose-600 via-pink-500 to-orange-400',
  'Logistics': 'from-emerald-700 via-teal-600 to-cyan-700',
  'Pharma': 'from-teal-600 via-cyan-500 to-blue-500',
  'Entertainment': 'from-purple-700 via-fuchsia-600 to-pink-500',
};

export function BusinessProfileSlide({ slide, sector }: BusinessProfileSlideProps) {
  const gradient = sectorGradients[sector] || sectorGradients['Manufacturing'];
  const icon = sectorIcons[sector] || sectorIcons['Manufacturing'];

  return (
    <div className="aspect-[16/9] bg-card rounded-xl overflow-hidden slide-shadow flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <SlideHeader title="Investment Teaser" />
        
        <div className="flex-1 flex gap-6 mt-6">
          {/* Hero Image Area - 60% */}
          <div className={`w-3/5 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="w-24 h-24 text-white/20">
              {icon}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                {sector}
              </span>
            </div>
          </div>

          {/* Text Content - 40% */}
          <div className="w-2/5 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-foreground mb-4 leading-tight">
              {slide.content.headline}
            </h2>
            <ul className="space-y-3">
              {slide.content.bullets.slice(0, 4).map((bullet, index) => (
                <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full kelp-gradient mt-1.5 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <SlideFooter pageNumber={1} />
      </div>
    </div>
  );
}
