import { CompanyData, TeaserOutput, TeaserSlide, KeyMetric, Citation, FinancialData, Sector } from '@/types/company';

function anonymizeText(text: string, companyKeywords: string[]): string {
  let result = text;
  companyKeywords.forEach(keyword => {
    if (keyword.length > 3) {
      const regex = new RegExp(keyword, 'gi');
      result = result.replace(regex, 'the company');
    }
  });
  // Remove specific locations
  result = result.replace(/Pune|Mumbai|Delhi|Bangalore|Chennai|Hyderabad|Kolkata/gi, 'strategic location');
  result = result.replace(/Maharashtra|Karnataka|Tamil Nadu|Gujarat|Rajasthan/gi, 'key region');
  return result;
}

function extractCompanyKeywords(data: CompanyData): string[] {
  const keywords: string[] = [];
  // Extract from business description - look for capitalized proper nouns
  const words = data.businessDescription.split(/\s+/);
  words.forEach(word => {
    if (word.length > 4 && /^[A-Z]/.test(word) && !['The', 'This', 'With', 'Their', 'They'].includes(word)) {
      keywords.push(word.replace(/[.,]/g, ''));
    }
  });
  return [...new Set(keywords)];
}

function generateBusinessProfileSlide(data: CompanyData, companyKeywords: string[]): TeaserSlide {
  const bullets: string[] = [];
  const citations: Citation[] = [];

  // Product/service diversity
  if (data.productsServices.length > 0) {
    const productText = `Diversified product portfolio spanning ${data.productsServices.length}+ categories including ${data.productsServices.slice(0, 2).map(p => p.split('(')[0].trim()).join(', ')}`;
    bullets.push(anonymizeText(productText, companyKeywords));
    citations.push({
      claim: productText,
      source: 'Product & Services section',
      section: 'Product & Services',
      confidence: 'high',
    });
  }

  // Industry presence
  if (data.applicationsIndustries.length > 0) {
    const industryText = `Serves ${data.applicationsIndustries.length}+ end-user industries including ${data.applicationsIndustries.slice(0, 3).join(', ')}`;
    bullets.push(anonymizeText(industryText, companyKeywords));
    citations.push({
      claim: industryText,
      source: 'Application areas / Industries served',
      section: 'Industries',
      confidence: 'high',
    });
  }

  // Global presence
  if (data.globalPresence.length > 0) {
    const globalText = `Global footprint with presence in ${data.globalPresence.join(', ')}`;
    bullets.push(anonymizeText(globalText, companyKeywords));
    citations.push({
      claim: globalText,
      source: 'Global Presence section',
      section: 'Global Presence',
      confidence: 'high',
    });
  }

  // Certifications
  if (data.certifications.length > 0) {
    const certText = `Quality-certified operations with ${data.certifications.filter(c => c.includes('ISO') || c.includes('IATF')).slice(0, 2).join(', ')} compliance`;
    if (certText.includes('ISO') || certText.includes('IATF')) {
      bullets.push(certText);
      citations.push({
        claim: certText,
        source: 'Awards and Certifications section',
        section: 'Certifications',
        confidence: 'high',
      });
    }
  }

  // Client base
  if (data.clients.length > 0) {
    const clientText = `Trusted supplier to ${data.clients.length}+ marquee customers across industries`;
    bullets.push(clientText);
    citations.push({
      claim: clientText,
      source: 'Clients section',
      section: 'Clients',
      confidence: 'medium',
    });
  }

  // Headline from business description
  const headline = data.businessDescription.split('.')[0].length < 100 
    ? anonymizeText(data.businessDescription.split('.')[0], companyKeywords)
    : 'Leading Industry Player with Diversified Operations';

  return {
    slideNumber: 1,
    type: 'business_profile',
    content: {
      headline,
      bullets: bullets.slice(0, 4),
      imageKeywords: getImageKeywords(data),
    },
    citations,
  };
}

function getImageKeywords(data: CompanyData): string[] {
  const template = data.templateType.toLowerCase();
  if (template.includes('manufacturing')) {
    return ['industrial facility', 'manufacturing plant', 'production line', 'engineering'];
  }
  if (template.includes('consumer') || template.includes('entertainment')) {
    return ['retail space', 'customer experience', 'modern interior'];
  }
  if (template.includes('electronics') || template.includes('technology')) {
    return ['technology', 'electronics', 'semiconductor', 'R&D lab'];
  }
  return ['business', 'corporate', 'industry'];
}

function generateFinancialSlide(data: CompanyData): TeaserSlide {
  const bullets: string[] = [];
  const citations: Citation[] = [];
  const metrics: KeyMetric[] = [];

  const financials = data.financials.incomeStatement;

  // Calculate growth if we have multi-year data
  if (financials.length >= 2) {
    const latest = financials[financials.length - 1];
    const previous = financials[financials.length - 2];
    
    if (latest.revenue && previous.revenue) {
      const growth = ((latest.revenue - previous.revenue) / previous.revenue * 100).toFixed(1);
      metrics.push({
        label: 'Revenue',
        value: `₹${latest.revenue.toFixed(0)}`,
        unit: 'Cr',
        change: parseFloat(growth),
        source: 'Financials Status > Income Statement',
      });
      bullets.push(`Revenue of ₹${latest.revenue.toFixed(0)} Cr with ${growth}% YoY growth`);
      citations.push({
        claim: `Revenue of ₹${latest.revenue.toFixed(0)} Cr`,
        source: 'Financials Status > Income Statement > Revenue From Operations',
        section: 'Financials',
        confidence: 'high',
      });
    }

    if (latest.ebitda && previous.ebitda) {
      const growth = ((latest.ebitda - previous.ebitda) / previous.ebitda * 100).toFixed(1);
      metrics.push({
        label: 'EBITDA',
        value: `₹${latest.ebitda.toFixed(0)}`,
        unit: 'Cr',
        change: parseFloat(growth),
        source: 'Financials Status > Income Statement',
      });
    }

    if (latest.pat) {
      const patGrowth = previous.pat ? ((latest.pat - previous.pat) / Math.abs(previous.pat) * 100).toFixed(1) : undefined;
      metrics.push({
        label: 'PAT',
        value: `₹${latest.pat.toFixed(0)}`,
        unit: 'Cr',
        change: patGrowth ? parseFloat(patGrowth) : undefined,
        source: 'Financials Status > Income Statement',
      });
    }
  }

  // Add operational metrics from key indicators
  data.keyOperationalIndicators.forEach((indicator, index) => {
    if (index < 3) {
      // Extract any numbers from the indicator
      const numberMatch = indicator.match(/₹?\s*(\d+(?:\.\d+)?)\s*(crore|cr|million|lakh)?/i);
      if (numberMatch) {
        metrics.push({
          label: `Key Metric ${index + 1}`,
          value: numberMatch[1],
          unit: numberMatch[2] || '',
        });
      }
    }
  });

  // Fill remaining metrics slots
  if (data.details.employees) {
    metrics.push({
      label: 'Employees',
      value: data.details.employees.split(' ')[0],
    });
  }

  if (data.details.founded) {
    const years = new Date().getFullYear() - parseInt(data.details.founded);
    metrics.push({
      label: 'Years in Operation',
      value: years.toString(),
      unit: 'years',
    });
  }

  return {
    slideNumber: 2,
    type: 'financial_scale',
    content: {
      headline: 'Financial & Operational Scale',
      bullets,
      metrics,
    },
    citations,
  };
}

function generateInvestmentHighlightsSlide(data: CompanyData, companyKeywords: string[]): TeaserSlide {
  const bullets: string[] = [];
  const citations: Citation[] = [];

  // From SWOT Strengths
  data.swot.strengths.forEach(strength => {
    const shortened = strength.split(':')[0] || strength.slice(0, 100);
    bullets.push(anonymizeText(shortened, companyKeywords));
    citations.push({
      claim: shortened,
      source: 'SWOT > Strengths',
      section: 'SWOT Analysis',
      confidence: 'high',
    });
  });

  // From Opportunities
  data.swot.opportunities.forEach(opp => {
    const shortened = opp.split(':')[0] || opp.slice(0, 100);
    bullets.push(anonymizeText(shortened, companyKeywords));
    citations.push({
      claim: shortened,
      source: 'SWOT > Opportunities',
      section: 'SWOT Analysis',
      confidence: 'high',
    });
  });

  return {
    slideNumber: 3,
    type: 'investment_highlights',
    content: {
      headline: 'Investment Thesis',
      bullets: bullets.slice(0, 6),
    },
    citations,
  };
}

export function generateTeaser(data: CompanyData, sector: Sector, confidence: number, sourceFile: string): TeaserOutput {
  const companyKeywords = extractCompanyKeywords(data);

  const slide1 = generateBusinessProfileSlide(data, companyKeywords);
  const slide2 = generateFinancialSlide(data);
  const slide3 = generateInvestmentHighlightsSlide(data, companyKeywords);

  const allCitations = [
    ...slide1.citations,
    ...slide2.citations,
    ...slide3.citations,
  ];

  return {
    metadata: {
      sector,
      sectorConfidence: confidence,
      generatedAt: new Date().toISOString(),
      sourceFile,
    },
    slides: [slide1, slide2, slide3],
    charts: {
      revenueData: data.financials.incomeStatement,
      marginsData: data.financials.incomeStatement.map(d => ({
        year: d.year,
        margin: d.margins || 0,
      })),
    },
    citations: allCitations,
  };
}
