export type Sector = 
  | 'Manufacturing' 
  | 'Consumer/D2C' 
  | 'Tech/Electronics' 
  | 'Pharma' 
  | 'Logistics'
  | 'Entertainment'
  | 'Defense';

export interface FinancialData {
  year: string;
  revenue: number;
  ebitda?: number;
  pat?: number;
  margins?: number;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface KeyMetric {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  source?: string;
}

export interface Citation {
  claim: string;
  source: string;
  section: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface SlideContent {
  headline: string;
  bullets: string[];
  imageKeywords?: string[];
  metrics?: KeyMetric[];
  chartData?: FinancialData[];
}

export interface TeaserSlide {
  slideNumber: number;
  type: 'business_profile' | 'financial_scale' | 'investment_highlights';
  content: SlideContent;
  citations: Citation[];
}

export interface CompanyData {
  templateType: string;
  businessDescription: string;
  productsServices: string[];
  applicationsIndustries: string[];
  keyOperationalIndicators: string[];
  financials: {
    incomeStatement: FinancialData[];
    balanceSheet: Record<string, number>;
    cashFlow: Record<string, number>;
  };
  swot: SWOT;
  marketSize: Array<{
    market: string;
    size: string;
    growth: string;
  }>;
  milestones: Array<{
    date: string;
    milestone: string;
  }>;
  clients: string[];
  certifications: string[];
  globalPresence: string[];
  futurePlans: string[];
  details: {
    founded: string;
    headquarters: string;
    domain: string;
    segment: string;
    employees: string;
  };
}

export interface ParsedCompany {
  raw: CompanyData;
  sector: Sector;
  sectorConfidence: number;
  sourceFileName: string;
}

export interface TeaserOutput {
  metadata: {
    sector: Sector;
    sectorConfidence: number;
    generatedAt: string;
    sourceFile: string;
  };
  slides: TeaserSlide[];
  charts: {
    revenueData: FinancialData[];
    marginsData: Array<{ year: string; margin: number }>;
  };
  citations: Citation[];
}

export interface ProcessingState {
  status: 'idle' | 'parsing' | 'detecting_sector' | 'extracting' | 'generating' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}
