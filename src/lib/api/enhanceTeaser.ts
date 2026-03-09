import { supabase } from '@/integrations/supabase/client';
import { CompanyData } from '@/types/company';
import { CompanyProfile } from '@/lib/companyProfiler';

export interface EnhancedTeaserContent {
  businessOverview: {
    headline: string;
    bullets: string[];
  };
  investmentHighlights: Array<{
    title: string;
    description: string;
  }>;
  growthStory: string[];
  sectorKeywords: string[];
  projectName: string;
  imageUrls: string[];
}

export async function enhanceTeaserContent(
  companyData: CompanyData,
  profile?: CompanyProfile
): Promise<EnhancedTeaserContent | null> {
  try {
    const { data, error } = await supabase.functions.invoke('enhance-teaser', {
      body: {
        companyData: {
          businessDescription: companyData.businessDescription,
          products: companyData.productsServices,
          keyMetrics: [
            { label: 'Employees', value: companyData.details.employees || 'N/A' },
            { label: 'Founded', value: companyData.details.founded || 'N/A' },
            { label: 'Certifications', value: companyData.certifications.length.toString() },
          ],
          financials: companyData.financials.incomeStatement.map(f => ({
            year: f.year,
            revenue: f.revenue,
            ebitda: f.ebitda,
            pat: f.pat,
          })),
          swot: companyData.swot,
          futurePlans: companyData.futurePlans,
          sector: companyData.templateType,
        },
        archetype: profile?.archetype,
        narrativeStrategy: profile?.narrativeStrategy,
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return null;
    }

    if (!data?.success) {
      console.error('Enhancement failed:', data?.error);
      return null;
    }

    return data.data as EnhancedTeaserContent;
  } catch (error) {
    console.error('Error calling enhance-teaser:', error);
    return null;
  }
}
