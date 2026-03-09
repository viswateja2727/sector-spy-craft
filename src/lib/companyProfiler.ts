import { CompanyData } from '@/types/company';

/**
 * Company Archetype Classification Engine
 * 
 * Classifies companies into archetypes and determines optimal teaser structure.
 * All decisions are data-driven — no invented metrics or generic phrases.
 */

export type CompanyArchetype = 
  | 'single_product'
  | 'multi_sku'
  | 'platform_saas'
  | 'asset_heavy'
  | 'service_b2b'
  | 'consumer_brand'
  | 'infra_logistics'
  | 'deep_tech';

export interface CompanyProfile {
  archetype: CompanyArchetype;
  confidence: number;
  reasoning: string;
  structureReasoning: string; // Why this slide structure fits this company
  slideStructure: SlideType[];
  narrativeStrategy: NarrativeStrategy;
  dataFlags: DataFlags;
}

export interface NarrativeStrategy {
  focus: string[];           // What to emphasize
  avoidGeneric: string[];    // Phrases to avoid
  dataBackedAngles: string[];// Statements derived from actual data
}

export interface DataFlags {
  hasMultiYearFinancials: boolean;
  hasStrongGrowth: boolean;
  hasDiversifiedProducts: boolean;
  hasGlobalPresence: boolean;
  hasCertifications: boolean;
  hasLargeClientBase: boolean;
  hasMarketSizeData: boolean;
  hasMilestones: boolean;
  hasOperationalIndicators: boolean;
  financialYearCount: number;
  productCount: number;
  industryCount: number;
  clientCount: number;
  certCount: number;
  revenueCAGR: number | null;
  latestRevenue: number | null;
  latestEBITDA: number | null;
  latestPAT: number | null;
}

export type SlideType = 
  | 'cover'
  | 'business_overview'
  | 'product_deep_dive'
  | 'product_portfolio_matrix'
  | 'financial_performance'
  | 'market_opportunity'
  | 'client_relationships'
  | 'operational_excellence'
  | 'investment_highlights'
  | 'growth_trajectory'
  | 'technology_platform'
  | 'network_footprint';

/**
 * Profile the company and determine optimal presentation structure.
 * All outputs are derived from the provided data — nothing invented.
 */
export function profileCompany(data: CompanyData): CompanyProfile {
  const dataFlags = analyzeDataRichness(data);
  const classification = classifyArchetype(data, dataFlags);
  const slideStructure = determineSlideStructure(classification.archetype, dataFlags);
  const narrativeStrategy = buildNarrativeStrategy(classification.archetype, data, dataFlags);
  const structureReasoning = explainStructure(classification.archetype, dataFlags, slideStructure);

  return {
    ...classification,
    slideStructure,
    narrativeStrategy,
    structureReasoning,
    dataFlags,
    // Legacy compat
    get narrativeAngles() { return narrativeStrategy.dataBackedAngles; },
  } as CompanyProfile;
}

function analyzeDataRichness(data: CompanyData): DataFlags {
  const financials = data.financials.incomeStatement;
  const hasMultiYearFinancials = financials.length >= 3;

  let hasStrongGrowth = false;
  let revenueCAGR: number | null = null;

  if (financials.length >= 2) {
    const sorted = [...financials].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (first.revenue && last.revenue && first.revenue > 0) {
      const years = parseInt(last.year) - parseInt(first.year);
      if (years > 0) {
        revenueCAGR = Math.round(((Math.pow(last.revenue / first.revenue, 1 / years) - 1) * 100) * 100) / 100;
        hasStrongGrowth = revenueCAGR > 15;
      }
    }
  }

  const latest = financials.length > 0 ? financials[financials.length - 1] : null;

  return {
    hasMultiYearFinancials,
    hasStrongGrowth,
    hasDiversifiedProducts: data.productsServices.length >= 4,
    hasGlobalPresence: data.globalPresence.length >= 3,
    hasCertifications: data.certifications.length >= 2,
    hasLargeClientBase: data.clients.length >= 5,
    hasMarketSizeData: data.marketSize.length >= 1,
    hasMilestones: data.milestones.length >= 3,
    hasOperationalIndicators: data.keyOperationalIndicators.length >= 2,
    financialYearCount: financials.length,
    productCount: data.productsServices.length,
    industryCount: data.applicationsIndustries.length,
    clientCount: data.clients.length,
    certCount: data.certifications.length,
    revenueCAGR,
    latestRevenue: latest?.revenue || null,
    latestEBITDA: latest?.ebitda || null,
    latestPAT: latest?.pat || null,
  };
}

function classifyArchetype(
  data: CompanyData,
  flags: DataFlags
): { archetype: CompanyArchetype; confidence: number; reasoning: string } {
  const desc = data.businessDescription.toLowerCase();
  const template = data.templateType.toLowerCase();
  const products = data.productsServices;
  const industries = data.applicationsIndustries;

  // Deep-tech / Aerospace / Defense
  const deepTechKeywords = ['aerospace', 'defense', 'defence', 'deep tech', 'deep-tech', 'semiconductor', 'space', 'radar', 'missile', 'satellite'];
  const deepTechScore = deepTechKeywords.filter(k => desc.includes(k) || template.includes(k)).length;
  if (deepTechScore >= 2) {
    return { archetype: 'deep_tech', confidence: 0.88, reasoning: `Deep-tech/Aerospace/Defense indicators detected (${deepTechScore} keyword matches in business description)` };
  }

  // Infrastructure / Logistics
  const infraKeywords = ['logistics', 'infrastructure', 'warehousing', 'supply chain', 'freight', 'transport', 'fleet', 'pipeline', 'port'];
  const infraScore = infraKeywords.filter(k => desc.includes(k) || template.includes(k)).length;
  if (infraScore >= 2) {
    return { archetype: 'infra_logistics', confidence: 0.86, reasoning: `Infrastructure/Logistics indicators detected (${infraScore} keyword matches)` };
  }

  // SaaS/Platform
  const saasKeywords = ['saas', 'platform', 'software', 'cloud', 'subscription', 'arr', 'mrr', 'api', 'it services', 'technology services'];
  const saasScore = saasKeywords.filter(k => desc.includes(k) || template.includes(k)).length;
  if (saasScore >= 2) {
    return { archetype: 'platform_saas', confidence: 0.88, reasoning: `Platform/SaaS/IT Services indicators detected (${saasScore} keyword matches)` };
  }

  // Consumer brand
  const consumerKeywords = ['d2c', 'direct to consumer', 'brand', 'retail', 'fmcg', 'consumer', 'e-commerce', 'ecommerce', 'cinema', 'entertainment', 'screen'];
  const consumerScore = consumerKeywords.filter(k => desc.includes(k) || template.includes(k)).length;
  if (consumerScore >= 2) {
    return { archetype: 'consumer_brand', confidence: 0.85, reasoning: `Consumer/D2C/Retail brand indicators detected` };
  }

  // Service/B2B
  const serviceKeywords = ['consulting', 'services', 'advisory', 'outsourcing', 'staffing', 'solutions provider'];
  const serviceScore = serviceKeywords.filter(k => desc.includes(k) || template.includes(k)).length;
  if (serviceScore >= 2 && products.length <= 3) {
    return { archetype: 'service_b2b', confidence: 0.82, reasoning: `B2B service model with ${products.length} service lines` };
  }

  // Manufacturing
  const mfgKeywords = ['manufactur', 'factory', 'plant', 'production', 'forging', 'machining', 'assembly', 'industrial'];
  const mfgScore = mfgKeywords.filter(k => desc.includes(k) || template.includes(k)).length;
  if (mfgScore >= 2) {
    if (products.length <= 2 && industries.length <= 3) {
      return { archetype: 'single_product', confidence: 0.85, reasoning: `Focused manufacturer with ${products.length} core product line(s) serving ${industries.length} industries` };
    }
    if (flags.hasDiversifiedProducts) {
      return { archetype: 'multi_sku', confidence: 0.88, reasoning: `Diversified manufacturer with ${products.length} product categories across ${industries.length} industries` };
    }
    return { archetype: 'asset_heavy', confidence: 0.84, reasoning: `Asset-heavy industrial operation with ${flags.certCount} certifications` };
  }

  // Fallback
  if (products.length <= 2) {
    return { archetype: 'single_product', confidence: 0.70, reasoning: `Limited product portfolio (${products.length} products) suggests single-product focus` };
  }
  if (products.length >= 5 || industries.length >= 4) {
    return { archetype: 'multi_sku', confidence: 0.72, reasoning: `Diversified across ${products.length} products and ${industries.length} industries` };
  }

  return { archetype: 'asset_heavy', confidence: 0.60, reasoning: `Default classification based on ${products.length} products, ${industries.length} industries` };
}

function determineSlideStructure(archetype: CompanyArchetype, flags: DataFlags): SlideType[] {
  const slides: SlideType[] = ['cover'];

  switch (archetype) {
    case 'single_product':
      slides.push('business_overview');
      slides.push('product_deep_dive');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      if (flags.hasLargeClientBase) slides.push('client_relationships');
      else if (flags.hasMarketSizeData) slides.push('market_opportunity');
      slides.push('investment_highlights');
      break;

    case 'multi_sku':
      slides.push('business_overview');
      slides.push('product_portfolio_matrix');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      if (flags.hasLargeClientBase) slides.push('client_relationships');
      slides.push('investment_highlights');
      break;

    case 'platform_saas':
      slides.push('technology_platform');
      if (flags.hasLargeClientBase) slides.push('client_relationships');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      slides.push('growth_trajectory');
      slides.push('investment_highlights');
      break;

    case 'consumer_brand':
      slides.push('network_footprint');
      if (flags.hasOperationalIndicators) slides.push('operational_excellence');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      if (flags.hasMarketSizeData) slides.push('market_opportunity');
      slides.push('investment_highlights');
      break;

    case 'infra_logistics':
      slides.push('business_overview');
      slides.push('operational_excellence');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      if (flags.hasGlobalPresence) slides.push('market_opportunity');
      slides.push('investment_highlights');
      break;

    case 'deep_tech':
      slides.push('technology_platform');
      slides.push('product_deep_dive');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      if (flags.hasMarketSizeData) slides.push('market_opportunity');
      slides.push('investment_highlights');
      break;

    case 'asset_heavy':
      slides.push('business_overview');
      slides.push('operational_excellence');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      if (flags.hasGlobalPresence) slides.push('market_opportunity');
      slides.push('investment_highlights');
      break;

    case 'service_b2b':
      slides.push('business_overview');
      if (flags.hasLargeClientBase) slides.push('client_relationships');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      slides.push('growth_trajectory');
      slides.push('investment_highlights');
      break;
  }

  // Ensure minimum 4 slides (cover + 3)
  if (slides.length < 4 && !slides.includes('financial_performance') && flags.hasMultiYearFinancials) {
    slides.splice(slides.length - 1, 0, 'financial_performance');
  }

  return slides.slice(0, 7);
}

/**
 * Build narrative strategy from actual data — no generic phrases.
 */
function buildNarrativeStrategy(
  archetype: CompanyArchetype,
  data: CompanyData,
  flags: DataFlags
): NarrativeStrategy {
  const focus: string[] = [];
  const avoidGeneric = [
    'strong growth trajectory',
    'well-positioned for growth',
    'significant market opportunity',
    'proven track record',
    'best-in-class',
  ];
  const dataBackedAngles: string[] = [];

  // Data-backed financial statements
  const financials = data.financials.incomeStatement;
  if (financials.length >= 2) {
    const sorted = [...financials].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (first.revenue && last.revenue) {
      dataBackedAngles.push(
        `Revenue from ₹${formatNum(first.revenue)} in FY${first.year} to ₹${formatNum(last.revenue)} in FY${last.year}`
      );
    }
    if (flags.revenueCAGR !== null) {
      dataBackedAngles.push(`Revenue CAGR of ${flags.revenueCAGR}% over ${sorted.length} years`);
    }
  }
  if (flags.latestEBITDA && flags.latestRevenue) {
    const margin = Math.round((flags.latestEBITDA / flags.latestRevenue) * 10000) / 100;
    dataBackedAngles.push(`EBITDA margin of ${margin}%`);
  }

  switch (archetype) {
    case 'single_product':
      focus.push('product differentiation', 'IP advantage', 'market leadership', 'scalability');
      if (flags.certCount > 0) dataBackedAngles.push(`${flags.certCount} quality certifications`);
      if (flags.industryCount > 0) dataBackedAngles.push(`Serves ${flags.industryCount} end-market industries`);
      break;
    case 'multi_sku':
      focus.push('manufacturing capability', 'product diversification', 'OEM relationships', 'global exports');
      dataBackedAngles.push(`${flags.productCount} product categories across ${flags.industryCount} industries`);
      if (flags.hasGlobalPresence) dataBackedAngles.push(`Presence in ${data.globalPresence.length} geographic markets`);
      break;
    case 'platform_saas':
      focus.push('recurring revenue', 'client retention', 'technology expertise', 'partnerships');
      if (flags.clientCount > 0) dataBackedAngles.push(`${flags.clientCount} active client relationships`);
      break;
    case 'consumer_brand':
      focus.push('network footprint', 'customer reach', 'brand strength', 'operating leverage');
      break;
    case 'infra_logistics':
      focus.push('network scale', 'operational infrastructure', 'sector tailwinds');
      if (flags.hasGlobalPresence) dataBackedAngles.push(`Operations across ${data.globalPresence.length} regions`);
      break;
    case 'deep_tech':
      focus.push('technology IP', 'defense/aerospace applications', 'high barriers to entry');
      if (flags.certCount > 0) dataBackedAngles.push(`${flags.certCount} specialized certifications`);
      break;
    case 'asset_heavy':
      focus.push('barriers to entry', 'operational efficiency', 'certifications');
      if (flags.certCount > 0) dataBackedAngles.push(`${flags.certCount} quality certifications`);
      break;
    case 'service_b2b':
      focus.push('client relationships', 'domain expertise', 'retention');
      if (flags.clientCount > 0) dataBackedAngles.push(`${flags.clientCount} client relationships`);
      break;
  }

  return { focus, avoidGeneric, dataBackedAngles };
}

function explainStructure(archetype: CompanyArchetype, flags: DataFlags, slides: SlideType[]): string {
  const parts: string[] = [];

  const archetypeDescriptions: Record<CompanyArchetype, string> = {
    single_product: 'a single-product/niche company, so the structure leads with a product deep-dive to highlight differentiation and competitive moat',
    multi_sku: 'a multi-SKU manufacturer, so the structure uses a product portfolio matrix to showcase breadth and diversification',
    platform_saas: 'a platform/SaaS/IT services company, so the structure leads with technology capabilities and emphasizes growth trajectory',
    consumer_brand: 'a consumer/retail brand, so the structure leads with network footprint and operational metrics',
    infra_logistics: 'an infrastructure/logistics company, so the structure emphasizes operational scale and network coverage',
    deep_tech: 'a deep-tech/aerospace/defense company, so the structure leads with technology platform and product capabilities',
    asset_heavy: 'an asset-intensive industrial company, so the structure highlights operational excellence and certifications',
    service_b2b: 'a B2B services company, so the structure foregrounds client relationships and domain expertise',
  };

  parts.push(`This company is classified as ${archetypeDescriptions[archetype]}.`);

  if (flags.hasMultiYearFinancials) {
    parts.push(`${flags.financialYearCount} years of financial data available, enabling trend visualization.`);
  } else {
    parts.push('Limited financial history — financial slide minimized.');
  }

  parts.push(`Structure: ${slides.length} slides total (${slides.filter(s => s !== 'cover').map(s => s.replace(/_/g, ' ')).join(' → ')}).`);

  return parts.join(' ');
}

function formatNum(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)} L`;
  return n.toLocaleString('en-IN');
}
