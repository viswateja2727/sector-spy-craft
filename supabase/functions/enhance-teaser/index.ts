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
  narrativeStrategy?: {
    focus: string[];
    avoidGeneric: string[];
    dataBackedAngles: string[];
  };
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

    const { companyData, archetype, narrativeStrategy }: TeaserInput = await req.json();

    const archetypeContext = archetype
      ? `\nCOMPANY ARCHETYPE: ${archetype}
Tailor your output to this business model:
- single_product: Focus on product differentiation, IP advantage, niche dominance, scalability
- multi_sku: Emphasize manufacturing capability, product diversification, OEM relationships, global exports
- platform_saas: Highlight recurring revenue, client retention, technology expertise, partnerships
- consumer_brand: Focus on network footprint, customer reach, brand strength, operating leverage
- infra_logistics: Emphasize network scale, operational infrastructure, sector tailwinds
- deep_tech: Focus on technology IP, defense/aerospace applications, high barriers to entry
- asset_heavy: Focus on barriers to entry, operational efficiency, certifications
- service_b2b: Emphasize client relationships, domain expertise, retention`
      : '';

    const narrativeContext = narrativeStrategy
      ? `\nNARRATIVE STRATEGY:
Focus areas: ${narrativeStrategy.focus.join(', ')}
Data-backed angles to incorporate: ${narrativeStrategy.dataBackedAngles.join('; ')}
PHRASES TO AVOID (generic IB clichés): ${narrativeStrategy.avoidGeneric.join(', ')}`
      : '';

    const systemPrompt = `You are an investment banking analyst writing M&A teaser content.

STRICT RULES — VIOLATIONS ARE UNACCEPTABLE:
1. Use ONLY information explicitly present in the provided dataset.
2. Do NOT invent statistics, percentages, counts, or any numbers not in the data.
3. If a metric is not present, OMIT IT — do not estimate or approximate.
4. Financial values must match EXACTLY with the dataset.
5. All calculations (growth, margins, CAGR) must be derivable from the provided numbers.
6. Do NOT use generic investment phrases like "strong growth trajectory", "well-positioned", "best-in-class", "proven track record" UNLESS directly supported by specific data points.
7. Instead use data-backed statements: "Revenue increased from ₹X in FY21 to ₹Y in FY25" or "EBITDA margin of X% in FY25".
8. NEVER mention specific company names, founder names, or exact locations.
9. Use "The Company", "The Target", or "Leading [Sector] Player".
10. Write like an investment banker, not a marketer.
${archetypeContext}
${narrativeContext}

OUTPUT FORMAT — Return ONLY valid JSON:
{
  "businessOverview": {
    "headline": "One data-backed sentence about the company's position",
    "bullets": ["4-5 data-backed business highlights, each referencing specific numbers from the dataset"]
  },
  "investmentHighlights": [
    {
      "title": "Short theme (3-4 words)",
      "description": "One data-backed sentence — must reference actual numbers or facts from the dataset"
    }
  ],
  "growthStory": [
    "3 data-backed narratives referencing specific financial or operational metrics from the dataset"
  ],
  "sectorKeywords": ["5 keywords for sector-relevant imagery"],
  "projectName": "Creative codename (e.g., Project Alpha, Project Horizon)"
}`;

    const userPrompt = `Transform this company data into investment teaser content. Use ONLY the data below — do not invent any numbers.

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

Generate professional, anonymized, DATA-BACKED content. Every claim must reference actual data from above. Return ONLY valid JSON.`;

    console.log('Calling Lovable AI Gateway with strict data-only prompt...');

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
        temperature: 0.5, // Lower temp for factual accuracy
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
    'logistics': [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=600&fit=crop',
    ],
    'defense': [
      'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c1a7a0?w=800&h=600&fit=crop',
    ],
    'entertainment': [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=600&fit=crop',
    ],
    'default': [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    ],
  };

  const keywordStr = keywords.join(' ').toLowerCase();
  if (keywordStr.includes('manufactur') || keywordStr.includes('factory')) return sectorImages.manufacturing;
  if (keywordStr.includes('tech') || keywordStr.includes('software') || keywordStr.includes('saas')) return sectorImages.technology;
  if (keywordStr.includes('pharma') || keywordStr.includes('medical')) return sectorImages.pharma;
  if (keywordStr.includes('logistic') || keywordStr.includes('transport') || keywordStr.includes('freight')) return sectorImages.logistics;
  if (keywordStr.includes('defense') || keywordStr.includes('defence') || keywordStr.includes('aerospace')) return sectorImages.defense;
  if (keywordStr.includes('cinema') || keywordStr.includes('entertainment') || keywordStr.includes('screen')) return sectorImages.entertainment;
  return sectorImages.default;
}
