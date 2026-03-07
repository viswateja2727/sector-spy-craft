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
  archetype?: string;
  narrativeAngles?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { companyData, archetype, narrativeAngles }: TeaserInput = await req.json();

    const archetypeContext = archetype
      ? `\nCOMPANY ARCHETYPE: ${archetype}
This company has been classified as a "${archetype}" type. Tailor your output accordingly:
- single_product: Focus on depth of the single offering, competitive moat, niche dominance
- multi_sku: Emphasize portfolio breadth, cross-selling, segment diversification
- platform_saas: Highlight network effects, recurring revenue, unit economics
- asset_heavy: Focus on barriers to entry, operational efficiency, certifications
- service_b2b: Emphasize client relationships, domain expertise, retention
- consumer_brand: Focus on brand equity, consumer trends, D2C advantages

${narrativeAngles?.length ? `KEY NARRATIVE ANGLES TO EMPHASIZE:\n${narrativeAngles.map(a => `- ${a}`).join('\n')}` : ''}`
      : '';

    const systemPrompt = `You are an investment banking analyst creating professional M&A teaser slides. 
Your task is to transform raw company data into compelling, anonymized investment narratives.

CRITICAL RULES:
1. NEVER mention specific company names, founder names, or exact locations
2. Use generic terms like "The Company", "The Target", "Leading [Sector] Player"
3. Preserve ALL numerical data exactly as provided
4. Write in professional investment banking language
5. Each bullet point should be impactful and value-focused
6. ADAPT your narrative structure to match the company's business model — do NOT use a generic template
${archetypeContext}

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "businessOverview": {
    "headline": "One compelling sentence about the company's market position, tailored to the business type",
    "bullets": ["4-5 anonymized key business highlights, adapted to what matters most for this type of business"]
  },
  "investmentHighlights": [
    {
      "title": "Short theme title (3-4 words)",
      "description": "Compelling one-liner about this investment merit"
    }
  ],
  "growthStory": [
    "3 compelling narratives about growth trajectory and strategy, specific to the business model"
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

Generate professional, anonymized content for the investment teaser. Return ONLY valid JSON.`;

    console.log('Calling Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
      if (response.status === 402) throw new Error('AI credits exhausted. Please add credits to your workspace.');
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error('No content returned from AI');

    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) jsonContent = jsonContent.slice(7);
    else if (jsonContent.startsWith('```')) jsonContent = jsonContent.slice(3);
    if (jsonContent.endsWith('```')) jsonContent = jsonContent.slice(0, -3);
    jsonContent = jsonContent.trim();

    const enhancedContent = JSON.parse(jsonContent);
    console.log('Enhanced content generated successfully');

    const imageUrls = await getStockImageUrls(enhancedContent.sectorKeywords || [companyData.sector]);

    return new Response(
      JSON.stringify({ success: true, data: { ...enhancedContent, imageUrls } }),
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
  const sectorImages: Record<string, string[]> = {
    'manufacturing': [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=600&fit=crop',
    ],
    'technology': [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
    ],
    'pharma': [
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop',
    ],
    'default': [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    ],
  };

  const keywordStr = keywords.join(' ').toLowerCase();
  if (keywordStr.includes('manufactur') || keywordStr.includes('factory')) return sectorImages.manufacturing;
  if (keywordStr.includes('tech') || keywordStr.includes('software')) return sectorImages.technology;
  if (keywordStr.includes('pharma') || keywordStr.includes('medical')) return sectorImages.pharma;
  return sectorImages.default;
}
