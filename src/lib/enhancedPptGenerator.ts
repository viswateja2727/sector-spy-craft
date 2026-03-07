import pptxgen from 'pptxgenjs';
import { TeaserOutput, FinancialData, CompanyData } from '@/types/company';
import { CompanyProfile, SlideType, CompanyArchetype } from './companyProfiler';

// Professional M&A Teaser Colors
const KELP_COLORS = {
  primary: '1E5A8A',
  secondary: 'E67E22',
  navy: '0D3B66',
  white: 'FFFFFF',
  lightGray: 'F5F7FA',
  textDark: '2C3E50',
  textMuted: '7F8C8D',
  accent: '0EA5E9',
  orange: 'E67E22',
  teal: '16A085',
  lightBlue: 'EBF5FB',
  chartBlue: '2980B9',
  chartOrange: 'E67E22',
  success: '27AE60',
};

export interface EnhancedSlideData {
  teaser: TeaserOutput;
  futurePlans: string[];
  projectName: string;
  companyData?: CompanyData;
  profile?: CompanyProfile;
  enhancedContent?: {
    businessOverview?: { headline: string; bullets: string[] };
    investmentHighlights?: Array<{ title: string; description: string }>;
    growthStory?: string[];
    imageUrls?: string[];
  };
}

// ─── Shared helpers ──────────────────────────────────────────

function addKelpLogo(slide: pptxgen.Slide, x = 0.5, y = 0.12, darkBg = true) {
  const textColor = darkBg ? KELP_COLORS.white : KELP_COLORS.primary;
  slide.addText([
    { text: '❖ ', options: { color: KELP_COLORS.orange, fontSize: 14, bold: true } },
    { text: 'Kelp', options: { color: textColor, fontSize: 14, bold: true, fontFace: 'Arial' } }
  ], { x, y, w: 1.2, h: 0.35 });
}

function addFooter(slide: pptxgen.Slide) {
  slide.addText('Strictly Private & Confidential – Prepared by Kelp M&A Team', {
    x: 0, y: 5.25, w: '100%', h: 0.25,
    fontSize: 8, color: KELP_COLORS.textMuted, align: 'center', fontFace: 'Arial',
  });
}

function addHeaderBar(slide: pptxgen.Slide, title: string) {
  slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.55, fill: { color: KELP_COLORS.navy } });
  slide.addText(title, {
    x: 0.3, y: 0.12, w: 7, h: 0.35,
    fontSize: 20, bold: true, color: KELP_COLORS.white, fontFace: 'Arial',
  });
  addKelpLogo(slide, 8.5, 0.12);
}

function addSectionHeader(slide: pptxgen.Slide, text: string, x: number, y: number, w: number, color = KELP_COLORS.primary) {
  slide.addShape('rect', { x, y, w, h: 0.32, fill: { color } });
  slide.addText(text, {
    x: x + 0.1, y: y + 0.02, w: w - 0.2, h: 0.28,
    fontSize: 11, bold: true, color: KELP_COLORS.white, fontFace: 'Arial',
  });
}

function getArchetypeLabel(archetype: CompanyArchetype): string {
  const labels: Record<CompanyArchetype, string> = {
    single_product: 'Focused Niche Player',
    multi_sku: 'Diversified Portfolio Company',
    platform_saas: 'Platform / Technology Company',
    asset_heavy: 'Industrial / Asset-Intensive Company',
    service_b2b: 'B2B Services Company',
    consumer_brand: 'Consumer Brand',
  };
  return labels[archetype] || 'Company';
}

// ─── Main entry point ────────────────────────────────────────

export async function generateEnhancedPowerPoint(data: EnhancedSlideData): Promise<void> {
  const pres = new pptxgen();
  pres.author = 'Kelp M&A Team';
  pres.company = 'Kelp';
  pres.subject = 'Investment Brief';
  pres.title = `${data.projectName} - Investment Brief`;
  pres.layout = 'LAYOUT_16x9';

  const profile = data.profile;
  const slideTypes: SlideType[] = profile?.slideStructure || [
    'cover', 'business_overview', 'financial_performance', 'investment_highlights'
  ];

  // Build slides dynamically based on the profile's recommended structure
  for (const slideType of slideTypes) {
    switch (slideType) {
      case 'cover':
        createCoverSlide(pres, data, profile);
        break;
      case 'business_overview':
        createBusinessOverviewSlide(pres, data, profile);
        break;
      case 'product_deep_dive':
        createProductDeepDiveSlide(pres, data);
        break;
      case 'product_portfolio_matrix':
        createProductPortfolioSlide(pres, data);
        break;
      case 'financial_performance':
        createFinancialSlide(pres, data);
        break;
      case 'market_opportunity':
        createMarketOpportunitySlide(pres, data);
        break;
      case 'client_relationships':
        createClientRelationshipsSlide(pres, data);
        break;
      case 'operational_excellence':
        createOperationalExcellenceSlide(pres, data);
        break;
      case 'growth_trajectory':
        createGrowthTrajectorySlide(pres, data);
        break;
      case 'investment_highlights':
        createInvestmentHighlightsSlide(pres, data, profile);
        break;
    }
  }

  const filename = `${data.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pptx`;
  await pres.writeFile({ fileName: filename });
}

// ─── COVER SLIDE ─────────────────────────────────────────────

function createCoverSlide(pres: pptxgen, data: EnhancedSlideData, profile?: CompanyProfile) {
  const slide = pres.addSlide();
  slide.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: KELP_COLORS.white } });
  slide.addShape('rect', { x: 0, y: 0, w: 0.15, h: '100%', fill: { color: KELP_COLORS.primary } });

  addKelpLogo(slide, 0.5, 0.4, false);

  slide.addText(data.projectName, {
    x: 0.5, y: 2.0, w: 9, h: 1.0,
    fontSize: 44, bold: true, color: KELP_COLORS.navy, fontFace: 'Arial',
  });

  // Adaptive subtitle based on archetype
  const subtitle = profile
    ? `Investment Brief | ${getArchetypeLabel(profile.archetype)}`
    : 'Investment Brief';

  slide.addText(subtitle, {
    x: 0.5, y: 3.1, w: 6, h: 0.5,
    fontSize: 18, color: KELP_COLORS.textMuted, fontFace: 'Arial',
  });

  slide.addShape('rect', { x: 0.5, y: 3.7, w: 2, h: 0.04, fill: { color: KELP_COLORS.orange } });

  // Show narrative angles on cover if available
  if (profile?.narrativeAngles && profile.narrativeAngles.length > 0) {
    let angleY = 3.9;
    profile.narrativeAngles.slice(0, 3).forEach((angle) => {
      slide.addText(`▸ ${angle}`, {
        x: 0.5, y: angleY, w: 6, h: 0.28,
        fontSize: 10, color: KELP_COLORS.textMuted, fontFace: 'Arial',
      });
      angleY += 0.3;
    });
  }

  slide.addText('Strictly Private & Confidential', {
    x: 0.5, y: 5.0, w: 3, h: 0.3,
    fontSize: 10, italic: true, color: KELP_COLORS.textMuted, fontFace: 'Arial',
  });
  slide.addText(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), {
    x: 7, y: 5.0, w: 2.5, h: 0.3,
    fontSize: 10, color: KELP_COLORS.textMuted, align: 'right', fontFace: 'Arial',
  });
}

// ─── BUSINESS OVERVIEW (universal) ──────────────────────────

function createBusinessOverviewSlide(pres: pptxgen, data: EnhancedSlideData, profile?: CompanyProfile) {
  const slide = pres.addSlide();
  const companyData = data.companyData;
  const slideData = data.teaser.slides[0];

  addHeaderBar(slide, 'Business Profile');

  // LEFT: Overview bullets
  addSectionHeader(slide, 'Business Overview', 0.3, 0.7, 5.2);
  const bullets = data.enhancedContent?.businessOverview?.bullets || slideData?.content.bullets || [];
  let yPos = 1.1;
  bullets.slice(0, 5).forEach((bullet) => {
    slide.addText([
      { text: '■ ', options: { color: KELP_COLORS.primary, fontSize: 9 } },
      { text: bullet, options: { color: KELP_COLORS.textDark, fontSize: 9, fontFace: 'Arial' } }
    ], { x: 0.4, y: yPos, w: 5, h: 0.42, valign: 'top' });
    yPos += 0.42;
  });

  // RIGHT: At-a-Glance metrics
  addSectionHeader(slide, 'At a Glance', 5.7, 0.7, 4.1, KELP_COLORS.orange);
  const metrics = data.teaser.slides[1]?.content.metrics || [];
  const glanceItems = buildGlanceItems(companyData, metrics, profile?.archetype);

  let glanceY = 1.1;
  glanceItems.forEach((item) => {
    slide.addText(item.icon, { x: 5.8, y: glanceY, w: 0.4, h: 0.3, fontSize: 14 });
    slide.addText(String(item.value), {
      x: 6.25, y: glanceY, w: 3.4, h: 0.22,
      fontSize: 11, bold: true, color: KELP_COLORS.primary, fontFace: 'Arial',
    });
    slide.addText(item.label, {
      x: 6.25, y: glanceY + 0.22, w: 3.4, h: 0.18,
      fontSize: 8, color: KELP_COLORS.textMuted, fontFace: 'Arial',
    });
    glanceY += 0.52;
  });

  // BOTTOM: Clients + Certs (if available)
  if (companyData?.clients && companyData.clients.length > 0) {
    addSectionHeader(slide, 'Key Clients', 0.3, 3.4, 5.2);
    let clientX = 0.4;
    companyData.clients.slice(0, 6).forEach((client) => {
      slide.addShape('roundRect', {
        x: clientX, y: 3.8, w: 1.5, h: 0.5,
        fill: { color: KELP_COLORS.lightGray },
        rectRadius: 0.05,
      });
      slide.addText(client.slice(0, 18), {
        x: clientX, y: 3.85, w: 1.5, h: 0.4,
        fontSize: 8, color: KELP_COLORS.textDark, align: 'center', fontFace: 'Arial',
      });
      clientX += 1.6;
    });
  }

  if (companyData?.certifications && companyData.certifications.length > 0) {
    addSectionHeader(slide, 'Certifications', 5.7, 3.4, 4.1, KELP_COLORS.teal);
    let certY = 3.8;
    companyData.certifications.slice(0, 6).forEach((cert) => {
      slide.addText(`✓ ${cert}`, {
        x: 5.8, y: certY, w: 3.9, h: 0.22,
        fontSize: 8, color: KELP_COLORS.textDark, fontFace: 'Arial',
      });
      certY += 0.24;
    });
  }

  addFooter(slide);
}

function buildGlanceItems(companyData?: CompanyData, metrics?: any[], archetype?: CompanyArchetype) {
  const items: Array<{ icon: string; label: string; value: string }> = [];

  if (companyData?.details?.founded) {
    const years = new Date().getFullYear() - parseInt(companyData.details.founded);
    items.push({ icon: '📅', label: 'Years in Operation', value: `${years}+ years` });
  }
  if (companyData?.details?.employees) {
    items.push({ icon: '👥', label: 'Team Size', value: companyData.details.employees });
  }
  if (companyData?.productsServices) {
    items.push({ icon: '📦', label: 'Product Lines', value: `${companyData.productsServices.length}+ SKUs` });
  }
  if (companyData?.globalPresence && companyData.globalPresence.length > 0) {
    items.push({ icon: '🌍', label: 'Markets', value: `${companyData.globalPresence.length}+ regions` });
  }
  if (companyData?.certifications && companyData.certifications.length > 0) {
    items.push({ icon: '🏅', label: 'Certifications', value: `${companyData.certifications.length} certifications` });
  }

  // Archetype-specific extras
  if (archetype === 'platform_saas') {
    items.push({ icon: '🔄', label: 'Revenue Model', value: 'Recurring / SaaS' });
  }
  if (archetype === 'consumer_brand') {
    items.push({ icon: '🛒', label: 'Channel', value: 'Direct-to-Consumer' });
  }

  return items.slice(0, 5);
}

// ─── PRODUCT DEEP DIVE (for single-product companies) ───────

function createProductDeepDiveSlide(pres: pptxgen, data: EnhancedSlideData) {
  const slide = pres.addSlide();
  const companyData = data.companyData;

  addHeaderBar(slide, 'Product Deep Dive');

  // Single product focus — show applications, value chain position, competitive advantages
  const product = companyData?.productsServices?.[0] || 'Core Product';

  addSectionHeader(slide, `Core Offering: ${typeof product === 'string' ? product.slice(0, 40) : 'Primary Product'}`, 0.3, 0.7, 9.5);

  // Applications served
  addSectionHeader(slide, 'Applications & End Markets', 0.3, 1.2, 4.5, KELP_COLORS.orange);
  const apps = companyData?.applicationsIndustries || [];
  let appY = 1.6;
  apps.slice(0, 6).forEach((app) => {
    slide.addText(`▸ ${app}`, {
      x: 0.4, y: appY, w: 4.3, h: 0.28,
      fontSize: 9, color: KELP_COLORS.textDark, fontFace: 'Arial',
    });
    appY += 0.3;
  });

  // Competitive advantages (from SWOT strengths)
  addSectionHeader(slide, 'Competitive Advantages', 5.1, 1.2, 4.7);
  const strengths = companyData?.swot.strengths || [];
  let sY = 1.6;
  strengths.slice(0, 5).forEach((s) => {
    slide.addText(`● ${s.split(':')[0] || s.slice(0, 60)}`, {
      x: 5.2, y: sY, w: 4.5, h: 0.32,
      fontSize: 9, color: KELP_COLORS.textDark, fontFace: 'Arial',
    });
    sY += 0.35;
  });

  // Market size if available
  if (companyData?.marketSize && companyData.marketSize.length > 0) {
    addSectionHeader(slide, 'Addressable Market', 0.3, 3.8, 9.5, KELP_COLORS.teal);
    let mX = 0.4;
    companyData.marketSize.slice(0, 3).forEach((m) => {
      slide.addShape('roundRect', {
        x: mX, y: 4.2, w: 3.0, h: 0.8,
        fill: { color: KELP_COLORS.lightBlue }, rectRadius: 0.05,
      });
      slide.addText(m.market, {
        x: mX + 0.1, y: 4.25, w: 2.8, h: 0.25,
        fontSize: 10, bold: true, color: KELP_COLORS.primary, fontFace: 'Arial',
      });
      slide.addText(`Size: ${m.size} | Growth: ${m.growth}`, {
        x: mX + 0.1, y: 4.55, w: 2.8, h: 0.2,
        fontSize: 8, color: KELP_COLORS.textDark, fontFace: 'Arial',
      });
      mX += 3.15;
    });
  }

  addFooter(slide);
}

// ─── PRODUCT PORTFOLIO MATRIX (for multi-SKU companies) ─────

function createProductPortfolioSlide(pres: pptxgen, data: EnhancedSlideData) {
  const slide = pres.addSlide();
  const companyData = data.companyData;

  addHeaderBar(slide, 'Product Portfolio & Market Reach');

  // Product grid
  addSectionHeader(slide, 'Product Portfolio', 0.3, 0.7, 4.5);
  const products = companyData?.productsServices || [];
  
  let pX = 0.4;
  let pY = 1.15;
  products.slice(0, 8).forEach((prod, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.4 + col * 2.3;
    const y = 1.15 + row * 0.55;

    slide.addShape('roundRect', {
      x, y, w: 2.1, h: 0.45,
      fill: { color: idx < 4 ? KELP_COLORS.lightBlue : KELP_COLORS.lightGray },
      rectRadius: 0.05,
    });
    slide.addText(`${idx + 1}. ${typeof prod === 'string' ? prod.slice(0, 28) : prod}`, {
      x: x + 0.1, y: y + 0.05, w: 1.9, h: 0.35,
      fontSize: 8, color: KELP_COLORS.textDark, fontFace: 'Arial', valign: 'middle',
    });
  });

  // Industries served — right side
  addSectionHeader(slide, 'Industries Served', 5.1, 0.7, 4.7, KELP_COLORS.orange);
  const industries = companyData?.applicationsIndustries || [];
  let indX = 5.2;
  let indY = 1.15;
  industries.slice(0, 8).forEach((ind, idx) => {
    slide.addShape('ellipse', {
      x: indX, y: indY, w: 0.35, h: 0.35,
      fill: { color: KELP_COLORS.primary },
    });
    slide.addText(`${idx + 1}`, {
      x: indX + 0.05, y: indY + 0.05, w: 0.25, h: 0.25,
      fontSize: 9, color: KELP_COLORS.white, align: 'center', fontFace: 'Arial',
    });
    slide.addText(ind.slice(0, 30), {
      x: indX + 0.45, y: indY, w: 4.1, h: 0.35,
      fontSize: 9, color: KELP_COLORS.textDark, fontFace: 'Arial', valign: 'middle',
    });
    indY += 0.42;
  });

  // Global presence at bottom if available
  if (companyData?.globalPresence && companyData.globalPresence.length > 0) {
    addSectionHeader(slide, 'Global Footprint', 0.3, 3.7, 9.5, KELP_COLORS.teal);
    
    // Pie chart for export/domestic
    slide.addChart('pie', [{
      name: 'Presence',
      labels: ['Export', 'Domestic'],
      values: [65, 35],
    }], {
      x: 0.3, y: 4.1, w: 2.0, h: 1.0,
      chartColors: [KELP_COLORS.primary, KELP_COLORS.orange],
      showPercent: true, showLegend: true, legendPos: 'b', legendFontSize: 7,
    });

    let mkX = 2.6;
    companyData.globalPresence.slice(0, 6).forEach((market) => {
      slide.addText(`● ${market}`, {
        x: mkX, y: 4.3, w: 1.4, h: 0.25,
        fontSize: 8, color: KELP_COLORS.textDark, fontFace: 'Arial',
      });
      mkX += 1.5;
    });
  }

  addFooter(slide);
}

// ─── FINANCIAL PERFORMANCE ──────────────────────────────────

function createFinancialSlide(pres: pptxgen, data: EnhancedSlideData) {
  const slide = pres.addSlide();
  const teaser = data.teaser;
  const companyData = data.companyData;

  addHeaderBar(slide, 'Financial Performance');

  // KPI boxes
  const metrics = teaser.slides[1]?.content.metrics || [];
  const kpiData = metrics.slice(0, 4).map((m) => ({
    label: m.label,
    value: `${m.value} ${m.unit || ''}`.trim(),
    change: m.change,
  }));

  // Fill with defaults if needed
  while (kpiData.length < 3) {
    kpiData.push({ label: 'Metric', value: 'N/A', change: undefined });
  }

  let kpiX = 0.3;
  kpiData.forEach((kpi) => {
    const bgColor = kpi.change && kpi.change > 0 ? KELP_COLORS.primary : KELP_COLORS.chartBlue;
    slide.addShape('roundRect', {
      x: kpiX, y: 0.7, w: 2.2, h: 0.7,
      fill: { color: bgColor }, rectRadius: 0.05,
    });
    slide.addText(kpi.value, {
      x: kpiX, y: 0.72, w: 2.2, h: 0.4,
      fontSize: 14, bold: true, color: KELP_COLORS.white, align: 'center', fontFace: 'Arial',
    });
    slide.addText(`${kpi.label}${kpi.change ? ` (${kpi.change > 0 ? '+' : ''}${kpi.change.toFixed(1)}%)` : ''}`, {
      x: kpiX, y: 1.12, w: 2.2, h: 0.25,
      fontSize: 8, color: KELP_COLORS.white, align: 'center', fontFace: 'Arial',
    });
    kpiX += 2.35;
  });

  // Bar chart
  const chartData = teaser.charts.revenueData || [];
  const filteredData = chartData.filter(d => d.revenue && d.revenue > 0);

  if (filteredData.length > 0) {
    const chartLabels = filteredData.map(d => d.year);
    const revenueValues = filteredData.map(d => d.revenue || 0);
    const ebitdaValues = filteredData.map(d => d.ebitda || 0);
    const patValues = filteredData.map(d => d.pat || 0);

    slide.addChart('bar', [
      { name: 'Revenue', labels: chartLabels, values: revenueValues },
      { name: 'EBITDA', labels: chartLabels, values: ebitdaValues },
      { name: 'PAT', labels: chartLabels, values: patValues },
    ], {
      x: 0.3, y: 1.6, w: 5.5, h: 3.2,
      barDir: 'col',
      barGrouping: 'clustered',
      chartColors: [KELP_COLORS.primary, KELP_COLORS.orange, KELP_COLORS.teal],
      showValue: true, dataLabelFontSize: 7, dataLabelColor: KELP_COLORS.textDark,
      catAxisLabelFontSize: 8, valAxisLabelFontSize: 7,
      showLegend: true, legendPos: 'b', legendFontSize: 8,
      valAxisMinVal: 0,
    });
  }

  // Growth story on right side
  addSectionHeader(slide, 'Growth Story', 6.0, 1.6, 3.8, KELP_COLORS.orange);
  const growthStories = data.enhancedContent?.growthStory || [
    'Strong revenue growth driven by market expansion',
    'Improving margins through operational efficiency',
    'Strategic investments in capacity expansion',
  ];

  let storyY = 2.0;
  growthStories.slice(0, 4).forEach((story) => {
    slide.addShape('roundRect', {
      x: 6.0, y: storyY, w: 3.8, h: 0.55,
      fill: { color: 'FEF9E7' }, line: { color: KELP_COLORS.orange, width: 0.5 },
      rectRadius: 0.05,
    });
    slide.addText(story, {
      x: 6.1, y: storyY + 0.08, w: 3.6, h: 0.4,
      fontSize: 8, color: KELP_COLORS.textDark, valign: 'middle', fontFace: 'Arial',
    });
    storyY += 0.62;
  });

  addFooter(slide);
}

// ─── MARKET OPPORTUNITY ─────────────────────────────────────

function createMarketOpportunitySlide(pres: pptxgen, data: EnhancedSlideData) {
  const slide = pres.addSlide();
  const companyData = data.companyData;

  addHeaderBar(slide, 'Market Opportunity');

  // Market size cards
  if (companyData?.marketSize && companyData.marketSize.length > 0) {
    addSectionHeader(slide, 'Addressable Markets', 0.3, 0.7, 9.5);

    let mX = 0.3;
    companyData.marketSize.slice(0, 3).forEach((m) => {
      const w = 3.0;
      slide.addShape('roundRect', {
        x: mX, y: 1.15, w, h: 1.2,
        fill: { color: KELP_COLORS.lightBlue }, rectRadius: 0.05,
        line: { color: KELP_COLORS.primary, width: 1 },
      });
      slide.addText(m.market, {
        x: mX + 0.15, y: 1.2, w: w - 0.3, h: 0.3,
        fontSize: 11, bold: true, color: KELP_COLORS.primary, fontFace: 'Arial',
      });
      slide.addText(`Market Size: ${m.size}`, {
        x: mX + 0.15, y: 1.55, w: w - 0.3, h: 0.25,
        fontSize: 9, color: KELP_COLORS.textDark, fontFace: 'Arial',
      });
      slide.addText(`Growth: ${m.growth}`, {
        x: mX + 0.15, y: 1.85, w: w - 0.3, h: 0.25,
        fontSize: 9, bold: true, color: KELP_COLORS.success, fontFace: 'Arial',
      });
      mX += 3.2;
    });
  }

  // Opportunities from SWOT
  addSectionHeader(slide, 'Growth Opportunities', 0.3, 2.6, 9.5, KELP_COLORS.orange);
  const opportunities = companyData?.swot.opportunities || [];
  let oY = 3.0;
  opportunities.slice(0, 4).forEach((opp, idx) => {
    slide.addText(`${idx + 1}.`, {
      x: 0.4, y: oY, w: 0.3, h: 0.35,
      fontSize: 12, bold: true, color: KELP_COLORS.orange, fontFace: 'Arial',
    });
    slide.addText(opp.split(':')[0] || opp.slice(0, 80), {
      x: 0.75, y: oY, w: 9.0, h: 0.35,
      fontSize: 9, color: KELP_COLORS.textDark, fontFace: 'Arial', valign: 'middle',
    });
    oY += 0.4;
  });

  // Global presence
  if (companyData?.globalPresence && companyData.globalPresence.length > 0) {
    addSectionHeader(slide, 'Geographic Reach', 0.3, 4.4, 9.5, KELP_COLORS.teal);
    slide.addText(companyData.globalPresence.join('  •  '), {
      x: 0.4, y: 4.8, w: 9.3, h: 0.3,
      fontSize: 10, color: KELP_COLORS.textDark, fontFace: 'Arial',
    });
  }

  addFooter(slide);
}

// ─── CLIENT RELATIONSHIPS (for service/B2B companies) ───────

function createClientRelationshipsSlide(pres: pptxgen, data: EnhancedSlideData) {
  const slide = pres.addSlide();
  const companyData = data.companyData;

  addHeaderBar(slide, 'Client Relationships & Market Position');

  addSectionHeader(slide, 'Marquee Client Base', 0.3, 0.7, 9.5);

  const clients = companyData?.clients || [];
  let cX = 0.4;
  let cY = 1.15;
  clients.slice(0, 12).forEach((client, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const x = 0.4 + col * 2.4;
    const y = 1.15 + row * 0.65;

    slide.addShape('roundRect', {
      x, y, w: 2.2, h: 0.55,
      fill: { color: KELP_COLORS.lightGray },
      rectRadius: 0.05, line: { color: KELP_COLORS.primary, width: 0.5 },
    });
    slide.addText(client.slice(0, 22), {
      x, y: y + 0.05, w: 2.2, h: 0.45,
      fontSize: 9, color: KELP_COLORS.textDark, align: 'center', fontFace: 'Arial', valign: 'middle',
    });
  });

  // Industries served below
  if (companyData?.applicationsIndustries && companyData.applicationsIndustries.length > 0) {
    addSectionHeader(slide, 'Industries Served', 0.3, 3.3, 9.5, KELP_COLORS.orange);
    slide.addText(companyData.applicationsIndustries.join('  |  '), {
      x: 0.4, y: 3.7, w: 9.3, h: 0.3,
      fontSize: 10, color: KELP_COLORS.textDark, fontFace: 'Arial',
    });
  }

  addFooter(slide);
}

// ─── OPERATIONAL EXCELLENCE (for asset-heavy/manufacturing) ─

function createOperationalExcellenceSlide(pres: pptxgen, data: EnhancedSlideData) {
  const slide = pres.addSlide();
  const companyData = data.companyData;

  addHeaderBar(slide, 'Operational Excellence');

  // Certifications
  addSectionHeader(slide, 'Quality & Certifications', 0.3, 0.7, 4.5);
  const certs = companyData?.certifications || [];
  let certY = 1.15;
  certs.slice(0, 8).forEach((cert) => {
    slide.addShape('roundRect', {
      x: 0.4, y: certY, w: 4.3, h: 0.35,
      fill: { color: KELP_COLORS.lightBlue }, rectRadius: 0.05,
    });
    slide.addText(`✓  ${cert}`, {
      x: 0.5, y: certY + 0.02, w: 4.1, h: 0.3,
      fontSize: 9, color: KELP_COLORS.textDark, fontFace: 'Arial', valign: 'middle',
    });
    certY += 0.4;
  });

  // Key operational indicators
  addSectionHeader(slide, 'Key Operational Indicators', 5.1, 0.7, 4.7, KELP_COLORS.orange);
  const indicators = companyData?.keyOperationalIndicators || [];
  let indY = 1.15;
  indicators.slice(0, 6).forEach((ind) => {
    slide.addText(`▸ ${ind.slice(0, 60)}`, {
      x: 5.2, y: indY, w: 4.5, h: 0.32,
      fontSize: 9, color: KELP_COLORS.textDark, fontFace: 'Arial',
    });
    indY += 0.35;
  });

  // Milestones timeline
  if (companyData?.milestones && companyData.milestones.length > 0) {
    addSectionHeader(slide, 'Key Milestones', 0.3, 3.7, 9.5, KELP_COLORS.teal);
    let mX = 0.4;
    companyData.milestones.slice(0, 4).forEach((ms) => {
      slide.addShape('ellipse', {
        x: mX + 0.8, y: 4.1, w: 0.15, h: 0.15,
        fill: { color: KELP_COLORS.teal },
      });
      slide.addText(ms.date, {
        x: mX, y: 4.3, w: 2.2, h: 0.2,
        fontSize: 8, bold: true, color: KELP_COLORS.teal, align: 'center', fontFace: 'Arial',
      });
      slide.addText(ms.milestone.slice(0, 35), {
        x: mX, y: 4.5, w: 2.2, h: 0.35,
        fontSize: 7, color: KELP_COLORS.textDark, align: 'center', fontFace: 'Arial',
      });
      mX += 2.4;
    });
    // Timeline line
    slide.addShape('rect', {
      x: 0.4, y: 4.15, w: 9.3, h: 0.03,
      fill: { color: KELP_COLORS.teal },
    });
  }

  addFooter(slide);
}

// ─── GROWTH TRAJECTORY (for SaaS/platform) ──────────────────

function createGrowthTrajectorySlide(pres: pptxgen, data: EnhancedSlideData) {
  const slide = pres.addSlide();

  addHeaderBar(slide, 'Growth Trajectory & Future Plans');

  // Future plans
  addSectionHeader(slide, 'Strategic Growth Initiatives', 0.3, 0.7, 9.5, KELP_COLORS.orange);
  const plans = data.futurePlans;
  let planY = 1.15;
  plans.slice(0, 5).forEach((plan, idx) => {
    slide.addShape('roundRect', {
      x: 0.3, y: planY, w: 9.5, h: 0.55,
      fill: { color: idx % 2 === 0 ? KELP_COLORS.lightBlue : KELP_COLORS.lightGray },
      rectRadius: 0.05,
    });
    slide.addText(`${idx + 1}`, {
      x: 0.4, y: planY + 0.05, w: 0.35, h: 0.35,
      fontSize: 14, bold: true, color: KELP_COLORS.primary, fontFace: 'Arial',
    });
    slide.addText(plan.slice(0, 100), {
      x: 0.85, y: planY + 0.05, w: 8.8, h: 0.45,
      fontSize: 9, color: KELP_COLORS.textDark, fontFace: 'Arial', valign: 'middle',
    });
    planY += 0.6;
  });

  // Growth story boxes
  const growthStories = data.enhancedContent?.growthStory || [];
  if (growthStories.length > 0) {
    addSectionHeader(slide, 'Growth Narrative', 0.3, 4.0, 9.5);
    let gsX = 0.4;
    growthStories.slice(0, 3).forEach((story) => {
      slide.addShape('roundRect', {
        x: gsX, y: 4.4, w: 3.0, h: 0.7,
        fill: { color: 'FEF9E7' }, line: { color: KELP_COLORS.orange, width: 0.5 },
        rectRadius: 0.05,
      });
      slide.addText(story, {
        x: gsX + 0.1, y: 4.45, w: 2.8, h: 0.6,
        fontSize: 8, color: KELP_COLORS.textDark, fontFace: 'Arial', valign: 'middle',
      });
      gsX += 3.15;
    });
  }

  addFooter(slide);
}

// ─── INVESTMENT HIGHLIGHTS ──────────────────────────────────

function createInvestmentHighlightsSlide(pres: pptxgen, data: EnhancedSlideData, profile?: CompanyProfile) {
  const slide = pres.addSlide();

  addHeaderBar(slide, 'Investment Highlights');

  // Investment highlights
  const highlights = data.enhancedContent?.investmentHighlights?.map(h => `${h.title}: ${h.description}`)
    || data.teaser.slides[2]?.content.bullets
    || ['Market leadership position', 'Strong financial performance', 'Clear growth trajectory'];

  const icons = ['🎯', '📊', '🚀', '🌍', '💎', '🔒'];

  let hY = 0.75;
  highlights.slice(0, 5).forEach((highlight, idx) => {
    // Icon circle
    slide.addShape('ellipse', {
      x: 0.4, y: hY, w: 0.45, h: 0.45,
      fill: { color: KELP_COLORS.primary },
    });
    slide.addText(icons[idx] || '✓', {
      x: 0.44, y: hY + 0.07, w: 0.37, h: 0.31,
      fontSize: 12, align: 'center',
    });

    // Highlight box
    slide.addShape('roundRect', {
      x: 1.0, y: hY, w: 8.8, h: 0.65,
      fill: { color: KELP_COLORS.white },
      line: { color: KELP_COLORS.primary, width: 0.5 },
      rectRadius: 0.05,
    });
    slide.addText(highlight, {
      x: 1.15, y: hY + 0.08, w: 8.5, h: 0.5,
      fontSize: 10, color: KELP_COLORS.textDark, valign: 'middle', fontFace: 'Arial',
    });
    hY += 0.75;
  });

  // Future plans at bottom
  if (data.futurePlans.length > 0) {
    addSectionHeader(slide, 'Growth Trajectory', 0.3, 4.55, 9.5, KELP_COLORS.orange);
    let planX = 0.4;
    data.futurePlans.slice(0, 3).forEach((plan) => {
      slide.addText(`→ ${plan.length > 70 ? plan.slice(0, 67) + '...' : plan}`, {
        x: planX, y: 4.92, w: 3.1, h: 0.3,
        fontSize: 8, color: KELP_COLORS.textMuted, fontFace: 'Arial',
      });
      planX += 3.15;
    });
  }

  addFooter(slide);
}
