import { useState, useCallback } from 'react';
import { KelpLogo } from '@/components/KelpLogo';
import { FileUploadZone } from '@/components/FileUploadZone';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { SlidePreview } from '@/components/slides/SlidePreview';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { parseMarkdownFile, detectSector } from '@/lib/markdownParser';
import { generateTeaser } from '@/lib/teaserGenerator';
import { ProcessingState, TeaserOutput, CompanyData, Sector } from '@/types/company';
import { ArrowRight, Sparkles, RotateCcw } from 'lucide-react';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [teaser, setTeaser] = useState<TeaserOutput | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);

  const simulateProgress = (
    status: ProcessingState['status'],
    progress: number,
    message: string,
    duration: number
  ): Promise<void> => {
    return new Promise(resolve => {
      setProcessingState({ status, progress, message });
      setTimeout(resolve, duration);
    });
  };

  const processFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    
    try {
      // Step 1: Parse file
      await simulateProgress('parsing', 15, 'Reading and parsing file structure...', 800);
      
      const content = await selectedFile.text();
      const parsedData = parseMarkdownFile(content, selectedFile.name);
      setCompanyData(parsedData);

      // Step 2: Detect sector
      await simulateProgress('detecting_sector', 40, 'Analyzing business model and industry...', 1000);
      
      const { sector, confidence } = detectSector(parsedData);

      // Step 3: Extract content
      await simulateProgress('extracting', 65, 'Extracting key metrics and highlights...', 1200);

      // Step 4: Generate teaser
      await simulateProgress('generating', 85, 'Creating anonymized investment teaser...', 1000);
      
      const generatedTeaser = generateTeaser(
        parsedData, 
        sector as Sector, 
        confidence, 
        selectedFile.name
      );
      
      setTeaser(generatedTeaser);

      // Complete
      setProcessingState({
        status: 'complete',
        progress: 100,
        message: 'Teaser generated successfully!',
      });
    } catch (error) {
      setProcessingState({
        status: 'error',
        progress: 0,
        message: 'Failed to process file',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  const handleReset = () => {
    setFile(null);
    setTeaser(null);
    setCompanyData(null);
    setProcessingState({
      status: 'idle',
      progress: 0,
      message: '',
    });
  };

  const isProcessing = ['parsing', 'detecting_sector', 'extracting', 'generating'].includes(processingState.status);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--kelp-indigo))] via-[hsl(var(--kelp-indigo-light))] to-[hsl(var(--kelp-pink))]/20 opacity-5" />
        
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center justify-between mb-16">
            <KelpLogo size="lg" />
            {teaser && (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Teaser
              </Button>
            )}
          </nav>

          {!teaser && (
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                Automated Deal Flow
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Transform Company Data into{' '}
                <span className="kelp-gradient-text">Investment Teasers</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Upload your company one-pager and instantly generate a beautiful, 
                anonymized 3-slide investment teaser with structured JSON export.
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        {processingState.status === 'idle' && !teaser && (
          <div className="space-y-8">
            <FileUploadZone 
              onFileSelect={processFile}
              isProcessing={false}
              acceptedFile={null}
            />
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Drop a markdown file to get started</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="max-w-xl mx-auto">
            <ProcessingStatus state={processingState} />
          </div>
        )}

        {processingState.status === 'complete' && teaser && (
          <div className="space-y-8">
            {/* Sector Badge */}
            <div className="flex items-center justify-center gap-4">
              <Badge className="kelp-gradient text-white px-4 py-1">
                {teaser.metadata.sector}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Confidence: {(teaser.metadata.sectorConfidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Slide Preview */}
            <SlidePreview 
              teaser={teaser} 
              futurePlans={companyData?.futurePlans || []}
              companyData={companyData || undefined}
            />
          </div>
        )}

        {processingState.status === 'error' && (
          <div className="max-w-xl mx-auto text-center">
            <div className="p-8 bg-destructive/10 rounded-xl border border-destructive/20">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Processing Error
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {processingState.error || 'An error occurred while processing the file.'}
              </p>
              <Button onClick={handleReset} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Kelp Automated Deal Flow • Investment Teaser Generator
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
