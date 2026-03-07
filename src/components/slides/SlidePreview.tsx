import { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, Copy, Check, FileDown, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BusinessProfileSlide } from './BusinessProfileSlide';
import { FinancialScaleSlide } from './FinancialScaleSlide';
import { InvestmentHighlightsSlide } from './InvestmentHighlightsSlide';
import { TeaserOutput, CompanyData } from '@/types/company';
import { cn } from '@/lib/utils';
import { generateEnhancedPowerPoint, EnhancedSlideData } from '@/lib/enhancedPptGenerator';
import { enhanceTeaserContent, EnhancedTeaserContent } from '@/lib/api/enhanceTeaser';
import { profileCompany, CompanyProfile } from '@/lib/companyProfiler';
import { toast } from 'sonner';

interface SlidePreviewProps {
  teaser: TeaserOutput;
  futurePlans: string[];
  companyData?: CompanyData;
}

const ARCHETYPE_LABELS: Record<string, string> = {
  single_product: '🎯 Single-Product Focus',
  multi_sku: '📦 Multi-SKU Portfolio',
  platform_saas: '💻 Platform / SaaS',
  asset_heavy: '🏭 Asset-Intensive Industrial',
  service_b2b: '🤝 B2B Services',
  consumer_brand: '🛒 Consumer Brand',
};

export function SlidePreview({ teaser, futurePlans, companyData }: SlidePreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState<EnhancedTeaserContent | null>(null);

  // Profile the company to determine optimal structure
  const profile: CompanyProfile | undefined = useMemo(() => {
    if (!companyData) return undefined;
    return profileCompany(companyData);
  }, [companyData]);

  const handlePrevSlide = () => setCurrentSlide(prev => Math.max(0, prev - 1));
  const handleNextSlide = () => setCurrentSlide(prev => Math.min(2, prev + 1));

  const handleDownloadPPT = useCallback(async () => {
    setGenerating(true);
    try {
      let aiContent: EnhancedTeaserContent | null = enhancedContent;

      if (!aiContent && companyData) {
        toast.info('Enhancing content with AI...', { duration: 2000 });
        aiContent = await enhanceTeaserContent(companyData, profile);
        if (aiContent) setEnhancedContent(aiContent);
      }

      const slideData: EnhancedSlideData = {
        teaser,
        futurePlans,
        projectName: aiContent?.projectName || 'Project Apex',
        companyData,
        profile,
        enhancedContent: aiContent ? {
          businessOverview: aiContent.businessOverview,
          investmentHighlights: aiContent.investmentHighlights,
          growthStory: aiContent.growthStory,
          imageUrls: aiContent.imageUrls,
        } : undefined,
      };

      await generateEnhancedPowerPoint(slideData);

      toast.success('PowerPoint generated successfully!', {
        description: profile
          ? `Adaptive ${profile.slideStructure.length}-slide structure for ${ARCHETYPE_LABELS[profile.archetype] || profile.archetype}`
          : 'Your editable PPT file has been downloaded.',
      });
    } catch (error) {
      console.error('PPT generation error:', error);
      toast.error('Failed to generate PowerPoint', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setGenerating(false);
    }
  }, [teaser, futurePlans, companyData, enhancedContent, profile]);

  const handleDownloadJSON = useCallback(() => {
    const dataStr = JSON.stringify(teaser, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teaser-${teaser.metadata.sourceFile.replace('.md', '')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [teaser]);

  const handleCopyJSON = useCallback(async () => {
    await navigator.clipboard.writeText(JSON.stringify(teaser, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [teaser]);

  const slides = teaser.slides;
  const metrics = slides[1]?.content.metrics || [];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Archetype Badge */}
      {profile && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            <Info className="w-3 h-3 mr-1" />
            {ARCHETYPE_LABELS[profile.archetype] || profile.archetype}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {profile.slideStructure.length} adaptive slides • {(profile.confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
      )}

      {/* Slide Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevSlide} disabled={currentSlide === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[80px] text-center">
            Slide {currentSlide + 1} of 3
          </span>
          <Button variant="outline" size="icon" onClick={handleNextSlide} disabled={currentSlide === 2}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyJSON}>
            {copied ? <><Check className="w-4 h-4 mr-1" />Copied!</> : <><Copy className="w-4 h-4 mr-1" />Copy JSON</>}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadJSON}>
            <Download className="w-4 h-4 mr-1" />Export JSON
          </Button>
          <Button size="sm" onClick={handleDownloadPPT} disabled={generating} className="kelp-gradient text-white">
            {generating ? (
              <><Sparkles className="w-4 h-4 mr-1 animate-pulse" />Generating with AI...</>
            ) : (
              <><FileDown className="w-4 h-4 mr-1" />Download PPT</>
            )}
          </Button>
        </div>
      </div>

      {/* Slide Container */}
      <div className="relative overflow-hidden rounded-2xl bg-muted/30 p-8">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          <div className="w-full flex-shrink-0 px-4">
            <BusinessProfileSlide slide={slides[0]} sector={teaser.metadata.sector} />
          </div>
          <div className="w-full flex-shrink-0 px-4">
            <FinancialScaleSlide slide={slides[1]} revenueData={teaser.charts.revenueData} metrics={metrics} />
          </div>
          <div className="w-full flex-shrink-0 px-4">
            <InvestmentHighlightsSlide slide={slides[2]} futurePlans={futurePlans} />
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentSlide === index
                ? "w-8 kelp-gradient"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
          />
        ))}
      </div>

      {/* Profile Details */}
      {profile && (
        <div className="mt-6 p-4 rounded-lg bg-muted/20 border border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">Adaptive Structure Reasoning</p>
          <p className="text-xs text-muted-foreground">{profile.reasoning}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {profile.slideStructure.map((s, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5">
                {s.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
