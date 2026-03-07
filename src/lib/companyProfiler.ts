import { CompanyData } from '@/types/company';

/**
 * Company Archetype Classification
 * 
 * Instead of forcing all companies into a fixed template, we analyze the data
 * to determine the best visual structure for the investment teaser.
 */

export type CompanyArchetype = 
  | 'single_product'      // Deep moat around one core offering
  | 'multi_sku'           // Diversified product portfolio across segments
  | 'platform_saas'       // Technology/platform with network effects
  | 'asset_heavy'         // Manufacturing/industrial with significant capex
  | 'service_b2b'         // Professional/B2B services, client-driven
  | 'consumer_brand';     // D2C/retail with brand value

export interface CompanyProfile {
  archetype: CompanyArchetype;
  confidence: number;
  reasoning: string;
  
  /** Which slide types to include, in order */
  slideStructure: SlideType[];
  
  /** Key narrative angles to emphasize */
  narrativeAngles: string[];
  
  /** Data richness flags — what data is available */
  dataFlags: {
    hasMultiYearFinancials: boolean;
    hasStrongGrowth: boolean;
    hasDiversifiedProducts: boolean;
    hasGlobalPresence: boolean;
    hasCertifications: boolean;
    hasLargeClientBase: boolean;
    hasMarketSizeData: boolean;
    hasMilestones: boolean;
  };
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
  | 'growth_trajectory';

/**
 * Analyze company data and determine the optimal presentation structure
 */
export function profileCompany(data: CompanyData): CompanyProfile {
  const dataFlags = analyzeDataRichness(data);
  const classification = classifyArchetype(data, dataFlags);
  const slideStructure = determineSlideStructure(classification.archetype, dataFlags);
  const narrativeAngles = determineNarrativeAngles(classification.archetype, data, dataFlags);

  return {
    ...classification,
    slideStructure,
    narrativeAngles,
    dataFlags,
  };
}

function analyzeDataRichness(data: CompanyData) {
  const financials = data.financials.incomeStatement;
  const hasMultiYearFinancials = financials.length >= 3;
  
  let hasStrongGrowth = false;
  if (financials.length >= 2) {
    const latest = financials[financials.length - 1];
    const prev = financials[financials.length - 2];
    if (latest.revenue && prev.revenue && prev.revenue > 0) {
      hasStrongGrowth = ((latest.revenue - prev.revenue) / prev.revenue) > 0.15;
    }
  }

  return {
    hasMultiYearFinancials,
    hasStrongGrowth,
    hasDiversifiedProducts: data.productsServices.length >= 4,
    hasGlobalPresence: data.globalPresence.length >= 3,
    hasCertifications: data.certifications.length >= 2,
    hasLargeClientBase: data.clients.length >= 5,
    hasMarketSizeData: data.marketSize.length >= 1,
    hasMilestones: data.milestones.length >= 3,
  };
}

function classifyArchetype(
  data: CompanyData,
  flags: ReturnType<typeof analyzeDataRichness>
): { archetype: CompanyArchetype; confidence: number; reasoning: string } {
  const desc = data.businessDescription.toLowerCase();
  const template = data.templateType.toLowerCase();
  const products = data.productsServices;
  const industries = data.applicationsIndustries;

  // SaaS/Platform detection
  const saasKeywords = ['saas', 'platform', 'software', 'cloud', 'subscription', 'arr', 'mrr', 'api'];
  const saasScore = saasKeywords.filter(k => desc.includes(k) || template.includes(k)).length;
  if (saasScore >= 2) {
    return { archetype: 'platform_saas', confidence: 0.88, reasoning: `Platform/SaaS indicators detected (${saasScore} keyword matches)` };
  }

  // Consumer brand detection
  const consumerKeywords = ['d2c', 'direct to consumer', 'brand', 'retail', 'fmcg', 'consumer', 'e-commerce', 'ecommerce'];
  const consumerScore = consumerKeywords.filter(k => desc.includes(k) || template.includes(k)).length;
  if (consumerScore >= 2) {
    return { archetype: 'consumer_brand', confidence: 0.85, reasoning: `Consumer/D2C brand indicators detected` };
  }

  // Service/B2B detection
  const serviceKeywords = ['consulting', 'services', 'advisory', 'outsourcing', 'staffing', 'solutions provider'];
  const serviceScore = serviceKeywords.filter(k => desc.includes(k) || template.includes(k)).length;
  if (serviceScore >= 2 && products.length <= 3) {
    return { archetype: 'service_b2b', confidence: 0.82, reasoning: `B2B service model with limited product SKUs` };
  }

  // Asset-heavy manufacturing
  const mfgKeywords = ['manufactur', 'factory', 'plant', 'production', 'forging', 'machining', 'assembly', 'industrial'];
  const mfgScore = mfgKeywords.filter(k => desc.includes(k) || template.includes(k)).length;
  if (mfgScore >= 2 && flags.hasCertifications) {
    // Single product vs multi-SKU within manufacturing
    if (products.length <= 2 && industries.length <= 3) {
      return { archetype: 'single_product', confidence: 0.85, reasoning: `Focused manufacturer with ${products.length} core product line(s) serving ${industries.length} industries` };
    }
    if (flags.hasDiversifiedProducts) {
      return { archetype: 'multi_sku', confidence: 0.88, reasoning: `Diversified manufacturer with ${products.length}+ product categories across ${industries.length}+ industries` };
    }
    return { archetype: 'asset_heavy', confidence: 0.84, reasoning: `Asset-heavy industrial operation with certification-driven quality` };
  }

  // Fallback: determine by product count and diversity
  if (products.length <= 2) {
    return { archetype: 'single_product', confidence: 0.70, reasoning: `Limited product portfolio suggests single-product focus` };
  }
  if (products.length >= 5 || industries.length >= 4) {
    return { archetype: 'multi_sku', confidence: 0.72, reasoning: `Diversified across ${products.length} products and ${industries.length} industries` };
  }

  return { archetype: 'asset_heavy', confidence: 0.60, reasoning: `Default classification based on available data` };
}

/**
 * Determine which slides to include based on archetype and data availability.
 * This is where the "adaptive structure" happens — different companies get different slides.
 */
function determineSlideStructure(
  archetype: CompanyArchetype,
  flags: ReturnType<typeof analyzeDataRichness>
): SlideType[] {
  const slides: SlideType[] = ['cover']; // Always start with cover

  switch (archetype) {
    case 'single_product':
      // Deep-dive into the one product, then market, then financials
      slides.push('business_overview');
      slides.push('product_deep_dive');
      if (flags.hasMarketSizeData) slides.push('market_opportunity');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      slides.push('investment_highlights');
      break;

    case 'multi_sku':
      // Portfolio view, then segment breakdown, then financials
      slides.push('business_overview');
      slides.push('product_portfolio_matrix');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      if (flags.hasLargeClientBase) slides.push('client_relationships');
      slides.push('investment_highlights');
      break;

    case 'platform_saas':
      // Platform overview, market opportunity, growth metrics
      slides.push('business_overview');
      if (flags.hasMarketSizeData) slides.push('market_opportunity');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      slides.push('growth_trajectory');
      slides.push('investment_highlights');
      break;

    case 'asset_heavy':
      // Operations, certifications, financials, then highlights
      slides.push('business_overview');
      slides.push('operational_excellence');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      if (flags.hasGlobalPresence) slides.push('market_opportunity');
      slides.push('investment_highlights');
      break;

    case 'service_b2b':
      // Client relationships front and center
      slides.push('business_overview');
      if (flags.hasLargeClientBase) slides.push('client_relationships');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      slides.push('investment_highlights');
      break;

    case 'consumer_brand':
      // Brand story, market opportunity, growth
      slides.push('business_overview');
      if (flags.hasMarketSizeData) slides.push('market_opportunity');
      if (flags.hasMultiYearFinancials) slides.push('financial_performance');
      if (flags.hasDiversifiedProducts) slides.push('product_portfolio_matrix');
      slides.push('investment_highlights');
      break;
  }

  // Ensure minimum 4 slides (cover + 3) and max 6
  if (slides.length < 4) {
    if (!slides.includes('financial_performance') && flags.hasMultiYearFinancials) {
      slides.splice(slides.length - 1, 0, 'financial_performance');
    }
  }

  return slides.slice(0, 7); // Max 7 slides
}

function determineNarrativeAngles(
  archetype: CompanyArchetype,
  data: CompanyData,
  flags: ReturnType<typeof analyzeDataRichness>
): string[] {
  const angles: string[] = [];

  switch (archetype) {
    case 'single_product':
      angles.push('Deep competitive moat in niche market');
      angles.push('Specialization drives pricing power and margins');
      if (flags.hasStrongGrowth) angles.push('Strong growth within focused segment');
      break;

    case 'multi_sku':
      angles.push('Diversified revenue streams reduce risk');
      angles.push('Cross-selling opportunities across product lines');
      if (flags.hasGlobalPresence) angles.push('Global reach amplifies portfolio value');
      break;

    case 'platform_saas':
      angles.push('Platform network effects create winner-take-most dynamics');
      angles.push('Recurring revenue provides visibility and predictability');
      angles.push('Low marginal cost of serving additional users');
      break;

    case 'asset_heavy':
      angles.push('Significant barriers to entry through capital-intensive operations');
      if (flags.hasCertifications) angles.push('Quality certifications create competitive moat');
      if (flags.hasGlobalPresence) angles.push('Global supply chain presence');
      break;

    case 'service_b2b':
      angles.push('Deep client relationships drive recurring revenues');
      angles.push('Domain expertise creates switching costs');
      if (flags.hasLargeClientBase) angles.push('Diversified client base reduces concentration risk');
      break;

    case 'consumer_brand':
      angles.push('Brand equity drives consumer preference and pricing power');
      if (flags.hasStrongGrowth) angles.push('Riding secular growth in consumer spending');
      angles.push('Direct-to-consumer channel provides margin advantage');
      break;
  }

  return angles;
}
