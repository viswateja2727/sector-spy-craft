import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface TeaserInput {
  companyData: {
    businessDescription: string;
    products: string[];
    keyMetrics: { label: string; value: string | number }[];
    financials: { year: number; revenue?: number; ebitda?: number; pat?: number }[];
    swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
    futurePlans: string[];
    sector: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { companyData }: TeaserInput = await req.json();

    const systemPrompt = `You are an investment banking analyst creating professional M&A teaser slides. 
Your task is to transform raw company data into compelling, anonymized investment narratives.

CRITICAL RULES:
1. NEVER mention specific company names, founder names, or exact locations
2. Use generic terms like "The Company", "The Target", "Leading [Sector] Player"
3. Preserve ALL numerical data exactly as provided
4. Write in professional investment banking language
5. Each bullet point should be impactful and value-focused

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "businessOverview": {
    "headline": "One compelling sentence about the company's market position",
    "bullets": ["4-5 anonymized key business highlights"]
  },
  "investmentHighlights": [
    {
      "title": "Short theme title (3-4 words)",
      "description": "Compelling one-liner about this investment merit"
    }
  ],
  "growthStory": [
    "3 compelling narratives about growth trajectory and strategy"
  ],
  "sectorKeywords": ["5 keywords for finding relevant stock images"],
  "projectName": "Creative codename for the deal (e.g., Project Alpha, Project Horizon)"
}`;

    const userPrompt = `Transform this company data into an investment teaser:

SECTOR: ${companyData.sector}

BUSINESS DESCRIPTION:
${companyData.businessDescription}

PRODUCTS/SERVICES:
${companyData.products.join(', ')}

KEY METRICS:
${companyData.keyMetrics.map(m => `- ${m.label}: ${m.value}`).join('\n')}

FINANCIALS:
${companyData.financials.map(f => `- FY${f.year}: Revenue ${f.revenue || 'N/A'}, EBITDA ${f.ebitda || 'N/A'}, PAT ${f.pat || 'N/A'}`).join('\n')}

STRENGTHS:
${companyData.swot.strengths.join('\n')}

OPPORTUNITIES:
${companyData.swot.opportunities.join('\n')}

FUTURE PLANS:
${companyData.futurePlans.join('\n')}

Generate professional, anonymized content for the investment teaser.`;

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const enhancedContent = JSON.parse(content);
    console.log('Enhanced content generated successfully');

    // Get stock image URLs based on sector keywords
    const imageUrls = await getStockImageUrls(enhancedContent.sectorKeywords || [companyData.sector]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          ...enhancedContent,
          imageUrls
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error enhancing teaser:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getStockImageUrls(keywords: string[]): Promise<string[]> {
  // Use Lorem Picsum for reliable, direct image URLs that work with pptxgenjs
  // These are high-quality stock photos with direct URLs (no redirects)
  const sectorImages: Record<string, string[]> = {
    'manufacturing': [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop',
    ],
    'technology': [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=600&fit=crop',
    ],
    'pharma': [
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop',
    ],
    'logistics': [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop',
    ],
    'consumer': [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    'default': [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=600&fit=crop',
    ],
  };

  // Determine sector from keywords
  const keywordStr = keywords.join(' ').toLowerCase();
  let selectedImages = sectorImages.default;
  
  if (keywordStr.includes('manufactur') || keywordStr.includes('factory') || keywordStr.includes('industrial')) {
    selectedImages = sectorImages.manufacturing;
  } else if (keywordStr.includes('tech') || keywordStr.includes('software') || keywordStr.includes('electronic')) {
    selectedImages = sectorImages.technology;
  } else if (keywordStr.includes('pharma') || keywordStr.includes('medical') || keywordStr.includes('health')) {
    selectedImages = sectorImages.pharma;
  } else if (keywordStr.includes('logistics') || keywordStr.includes('transport') || keywordStr.includes('shipping')) {
    selectedImages = sectorImages.logistics;
  } else if (keywordStr.includes('consumer') || keywordStr.includes('retail') || keywordStr.includes('d2c')) {
    selectedImages = sectorImages.consumer;
  }

  return selectedImages;
}
