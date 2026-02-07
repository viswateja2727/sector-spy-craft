import pptxgen from 'pptxgenjs';
import { TeaserOutput, FinancialData, CompanyData } from '@/types/company';

// Professional M&A Teaser Colors
const KELP_COLORS = {
  primary: '1E5A8A',      // Dark teal blue
  secondary: 'E67E22',    // Orange accent
  navy: '0D3B66',         // Dark navy
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
  enhancedContent?: {
    businessOverview?: {
      headline: string;
      bullets: string[];
    };
    investmentHighlights?: Array<{
      title: string;
      description: string;
    }>;
    growthStory?: string[];
    imageUrls?: string[];
  };
}

// Industry icons mapping using emoji/text symbols
const INDUSTRY_ICONS: Record<string, string> = {
  'bakery': '🧁',
  'food': '🍽️',
  'cosmetics': '💄',
  'mining': '⛏️',
  'textile': '🧵',
  'oil': '🛢️',
  'gas': '🛢️',
  'pet food': '🐕',
  'pharma': '💊',
  'pharmaceutical': '💊',
  'chemical': '🧪',
  'manufacturing': '🏭',
  'technology': '💻',
  'logistics': '🚚',
  'automotive': '🚗',
  'consumer': '🛒',
  'retail': '🏪',
  'healthcare': '🏥',
  'agriculture': '🌾',
  'construction': '🏗️',
  'energy': '⚡',
  'default': '🏢',
};

export async function generateEnhancedPowerPoint(data: EnhancedSlideData): Promise<void> {
  const pres = new pptxgen();

  // Set presentation metadata
  pres.author = 'Kelp M&A Team';
  pres.company = 'Kelp';
  pres.subject = 'Investment Brief';
  pres.title = `${data.projectName} - Investment Brief`;
  pres.layout = 'LAYOUT_16x9';

  // Create all slides
  createSimpleCoverSlide(pres, data.projectName);
  createBusinessProfileSlide(pres, data);
  createFinancialMetricsSlide(pres, data);
  createInvestmentHighlightsSlide(pres, data);

  // Generate filename with date
  const filename = `${data.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pptx`;
  
  await pres.writeFile({ fileName: filename });
}

function addKelpLogo(slide: pptxgen.Slide, x: number = 0.5, y: number = 0.12, darkBg: boolean = true) {
  const textColor = darkBg ? KELP_COLORS.white : KELP_COLORS.primary;
  slide.addText([
    { text: '❖ ', options: { color: KELP_COLORS.orange, fontSize: 14, bold: true } },
    { text: 'Kelp', options: { color: textColor, fontSize: 14, bold: true, fontFace: 'Arial' } }
  ], { x, y, w: 1.2, h: 0.35 });
}

function addFooter(slide: pptxgen.Slide) {
  slide.addText('Strictly Private & Confidential – Prepared by Kelp M&A Team', {
    x: 0,
    y: 5.25,
    w: '100%',
    h: 0.25,
    fontSize: 8,
    color: KELP_COLORS.textMuted,
    align: 'center',
    fontFace: 'Arial',
  });
}

function addSectionHeader(slide: pptxgen.Slide, text: string, x: number, y: number, w: number, color: string = KELP_COLORS.primary) {
  slide.addShape('rect', {
    x,
    y,
    w,
    h: 0.32,
    fill: { color },
  });
  slide.addText(text, {
    x: x + 0.1,
    y: y + 0.02,
    w: w - 0.2,
    h: 0.28,
    fontSize: 11,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });
}

// Slide 1: Simple, clean cover slide
function createSimpleCoverSlide(pres: pptxgen, projectName: string) {
  const slide = pres.addSlide();

  // Clean white background
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: '100%',
    fill: { color: KELP_COLORS.white },
  });

  // Left accent bar
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 0.15,
    h: '100%',
    fill: { color: KELP_COLORS.primary },
  });

  // Kelp Logo - top left
  addKelpLogo(slide, 0.5, 0.4, false);

  // Project Name - large and centered
  slide.addText(projectName, {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 1.0,
    fontSize: 44,
    bold: true,
    color: KELP_COLORS.navy,
    fontFace: 'Arial',
  });

  // Subtitle
  slide.addText('Investment Brief', {
    x: 0.5,
    y: 3.3,
    w: 4,
    h: 0.5,
    fontSize: 20,
    color: KELP_COLORS.textMuted,
    fontFace: 'Arial',
  });

  // Decorative line
  slide.addShape('rect', {
    x: 0.5,
    y: 3.9,
    w: 2,
    h: 0.04,
    fill: { color: KELP_COLORS.orange },
  });

  // Confidential notice at bottom
  slide.addText('Strictly Private & Confidential', {
    x: 0.5,
    y: 5.0,
    w: 3,
    h: 0.3,
    fontSize: 10,
    italic: true,
    color: KELP_COLORS.textMuted,
    fontFace: 'Arial',
  });

  // Date
  slide.addText(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), {
    x: 7,
    y: 5.0,
    w: 2.5,
    h: 0.3,
    fontSize: 10,
    color: KELP_COLORS.textMuted,
    align: 'right',
    fontFace: 'Arial',
  });
}

// Slide 2: Business Profile with customers, applications, certifications
function createBusinessProfileSlide(pres: pptxgen, data: EnhancedSlideData) {
  const slide = pres.addSlide();
  const teaser = data.teaser;
  const companyData = data.companyData;
  const slideData = teaser.slides[0];

  // Header bar
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.55,
    fill: { color: KELP_COLORS.navy },
  });

  slide.addText('Business Profile', {
    x: 0.3,
    y: 0.12,
    w: 5,
    h: 0.35,
    fontSize: 20,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  addKelpLogo(slide, 8.5, 0.12);

  // LEFT COLUMN - Business Overview
  addSectionHeader(slide, 'Business Overview', 0.3, 0.7, 5.2);

  // Business bullets
  const bullets = data.enhancedContent?.businessOverview?.bullets || slideData.content.bullets || [];
  let yPos = 1.1;
  bullets.slice(0, 5).forEach((bullet) => {
    slide.addText([
      { text: '■ ', options: { color: KELP_COLORS.primary, fontSize: 9 } },
      { text: bullet, options: { color: KELP_COLORS.textDark, fontSize: 9, fontFace: 'Arial' } }
    ], {
      x: 0.4,
      y: yPos,
      w: 5,
      h: 0.42,
      valign: 'top',
    });
    yPos += 0.42;
  });

  // MIDDLE COLUMN - Key Select Customers
  addSectionHeader(slide, 'Key Select Customers', 5.6, 0.7, 2.0);

  // Customer logos placeholder area
  slide.addShape('rect', {
    x: 5.6,
    y: 1.1,
    w: 2.0,
    h: 1.8,
    fill: { color: KELP_COLORS.lightGray },
    line: { color: KELP_COLORS.primary, width: 0.5, dashType: 'dash' },
  });

  // Placeholder text for customer logos
  const clients = companyData?.clients || ['Major Client 1', 'Major Client 2', 'Major Client 3'];
  let clientY = 1.25;
  clients.slice(0, 4).forEach((client) => {
    slide.addText(`• ${client}`, {
      x: 5.7,
      y: clientY,
      w: 1.8,
      h: 0.35,
      fontSize: 8,
      color: KELP_COLORS.textDark,
      fontFace: 'Arial',
    });
    clientY += 0.35;
  });

  slide.addText('...and others', {
    x: 5.7,
    y: 2.6,
    w: 1.8,
    h: 0.25,
    fontSize: 8,
    italic: true,
    color: KELP_COLORS.textMuted,
    fontFace: 'Arial',
  });

  // RIGHT COLUMN - At a Glance
  addSectionHeader(slide, 'At a Glance', 7.7, 0.7, 2.1, KELP_COLORS.orange);

  const metrics = teaser.slides[1]?.content.metrics || [];
  const glanceItems = [
    { icon: '🏭', label: 'Facilities', value: companyData?.details?.headquarters || '2 Facilities' },
    { icon: '📦', label: 'Products', value: `${companyData?.productsServices?.length || 50}+ Grades` },
    { icon: '🔬', label: 'R&D', value: 'In-house Lab' },
    { icon: '👥', label: 'Employees', value: companyData?.details?.employees || metrics.find(m => m.label === 'Employees')?.value || '500+' },
  ];

  let glanceY = 1.1;
  glanceItems.forEach((item) => {
    slide.addText(item.icon, { x: 7.75, y: glanceY, w: 0.3, h: 0.25, fontSize: 12 });
    slide.addText(item.value.toString(), {
      x: 8.1,
      y: glanceY,
      w: 1.6,
      h: 0.22,
      fontSize: 10,
      bold: true,
      color: KELP_COLORS.primary,
      fontFace: 'Arial',
    });
    slide.addText(item.label, {
      x: 8.1,
      y: glanceY + 0.2,
      w: 1.6,
      h: 0.18,
      fontSize: 8,
      color: KELP_COLORS.textMuted,
      fontFace: 'Arial',
    });
    glanceY += 0.55;
  });

  // BOTTOM SECTION - Product Portfolio & Applications
  addSectionHeader(slide, 'Product Portfolio and Offering Solutions to Diverse Sectors', 0.3, 3.3, 9.5);

  // Products column
  const products = companyData?.productsServices?.slice(0, 4) || ['Product A', 'Product B', 'Product C', 'Product D'];
  let prodY = 3.75;
  
  slide.addShape('rect', {
    x: 0.3,
    y: 3.7,
    w: 2.0,
    h: 1.4,
    fill: { color: KELP_COLORS.lightBlue },
  });
  
  slide.addText('Products', {
    x: 0.4,
    y: 3.72,
    w: 1.8,
    h: 0.25,
    fontSize: 9,
    bold: true,
    color: KELP_COLORS.primary,
    fontFace: 'Arial',
  });

  products.forEach((prod) => {
    slide.addText(`• ${typeof prod === 'string' ? prod.slice(0, 25) : prod}`, {
      x: 0.4,
      y: prodY + 0.25,
      w: 1.8,
      h: 0.25,
      fontSize: 8,
      color: KELP_COLORS.textDark,
      fontFace: 'Arial',
    });
    prodY += 0.25;
  });

  // Applications/Industries icons
  const applications = companyData?.applicationsIndustries || ['Bakery', 'Cosmetics', 'Mining', 'Textile', 'Oil & Gas', 'Pet Food'];
  let appX = 2.5;
  const appY = 3.75;
  
  applications.slice(0, 6).forEach((app) => {
    const appLower = app.toLowerCase();
    let icon = INDUSTRY_ICONS.default;
    
    // Find matching icon
    for (const [key, emoji] of Object.entries(INDUSTRY_ICONS)) {
      if (appLower.includes(key)) {
        icon = emoji;
        break;
      }
    }

    // Icon circle
    slide.addShape('ellipse', {
      x: appX + 0.25,
      y: appY,
      w: 0.5,
      h: 0.5,
      fill: { color: KELP_COLORS.lightBlue },
    });
    slide.addText(icon, {
      x: appX + 0.28,
      y: appY + 0.1,
      w: 0.45,
      h: 0.35,
      fontSize: 14,
      align: 'center',
    });
    slide.addText(app.slice(0, 12), {
      x: appX,
      y: appY + 0.55,
      w: 1.0,
      h: 0.25,
      fontSize: 7,
      color: KELP_COLORS.textDark,
      align: 'center',
      fontFace: 'Arial',
    });
    appX += 1.1;
  });

  // Certifications section
  addSectionHeader(slide, 'Certifications', 7.7, 3.3, 2.1, KELP_COLORS.teal);

  const certifications = companyData?.certifications || ['ISO 9001', 'ISO 14001', 'FSSC 22000', 'FDA'];
  let certY = 3.72;
  
  certifications.slice(0, 6).forEach((cert) => {
    slide.addText(`✓ ${cert}`, {
      x: 7.8,
      y: certY,
      w: 1.9,
      h: 0.22,
      fontSize: 8,
      color: KELP_COLORS.textDark,
      fontFace: 'Arial',
    });
    certY += 0.22;
  });

  addFooter(slide);
}

// Slide 3: Financial Metrics with Pie Chart and Map placeholder
function createFinancialMetricsSlide(pres: pptxgen, data: EnhancedSlideData) {
  const slide = pres.addSlide();
  const teaser = data.teaser;
  const companyData = data.companyData;

  // Header bar
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.55,
    fill: { color: KELP_COLORS.navy },
  });

  slide.addText('Key Financial Metrics and Growth Story', {
    x: 0.3,
    y: 0.12,
    w: 6,
    h: 0.35,
    fontSize: 20,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  addKelpLogo(slide, 8.5, 0.12);

  // LEFT SIDE - Financial Metrics
  addSectionHeader(slide, 'Key Financial Metrics (Latest FY)', 0.3, 0.7, 5.5, KELP_COLORS.orange);

  // KPI Boxes
  const metrics = teaser.slides[1]?.content.metrics || [];
  const kpiData = [
    { label: 'Employees', value: String(metrics.find(m => m.label === 'Employees')?.value || companyData?.details?.employees || '955'), color: KELP_COLORS.primary },
    { label: 'EBITDA Margin', value: '~20%', color: KELP_COLORS.orange },
    { label: 'RoCE', value: '25%+', color: KELP_COLORS.teal },
    { label: 'Debt Status', value: 'Low', color: KELP_COLORS.chartBlue },
  ];

  let kpiX = 0.4;
  kpiData.forEach((kpi) => {
    slide.addShape('rect', {
      x: kpiX,
      y: 1.1,
      w: 1.3,
      h: 0.7,
      fill: { color: kpi.color },
    });
    slide.addText(kpi.value, {
      x: kpiX,
      y: 1.15,
      w: 1.3,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: KELP_COLORS.white,
      align: 'center',
      fontFace: 'Arial',
    });
    slide.addText(kpi.label, {
      x: kpiX,
      y: 1.55,
      w: 1.3,
      h: 0.2,
      fontSize: 7,
      color: KELP_COLORS.white,
      align: 'center',
      fontFace: 'Arial',
    });
    kpiX += 1.38;
  });

  // Revenue chart
  const chartData = teaser.charts.revenueData || [];
  if (chartData.length > 0) {
    const filteredData = chartData.filter(d => d.revenue && d.revenue > 0);
    
    if (filteredData.length > 0) {
      const chartLabels = filteredData.map(d => `FY${String(d.year).slice(-2)}`);
      const revenueValues = filteredData.map(d => d.revenue || 0);
      const ebitdaValues = filteredData.map(d => d.ebitda || 0);
      const patValues = filteredData.map(d => d.pat || 0);

      slide.addChart('bar', [
        { name: 'PAT', labels: chartLabels, values: patValues },
        { name: 'EBITDA', labels: chartLabels, values: ebitdaValues },
        { name: 'Revenue', labels: chartLabels, values: revenueValues },
      ], {
        x: 0.3,
        y: 1.95,
        w: 5.5,
        h: 2.5,
        barDir: 'bar',
        barGrouping: 'clustered',
        chartColors: [KELP_COLORS.teal, KELP_COLORS.orange, KELP_COLORS.primary],
        showValue: true,
        dataLabelFontSize: 7,
        dataLabelColor: KELP_COLORS.textDark,
        dataLabelPosition: 'outEnd',
        catAxisLabelFontSize: 8,
        valAxisLabelFontSize: 7,
        showLegend: true,
        legendPos: 'b',
        legendFontSize: 7,
        valAxisMinVal: 0,
      });
    }
  }

  // RIGHT SIDE - Growth Story boxes
  const growthStories = data.enhancedContent?.growthStory || [
    'Strong revenue growth driven by market expansion',
    'Improving margins through operational efficiency',
    'Strategic investments in capacity expansion',
  ];

  let storyY = 0.7;
  growthStories.slice(0, 3).forEach((story) => {
    slide.addShape('rect', {
      x: 5.95,
      y: storyY,
      w: 3.85,
      h: 0.65,
      fill: { color: 'FEF9E7' },
      line: { color: KELP_COLORS.orange, width: 1 },
    });
    slide.addText(story, {
      x: 6.05,
      y: storyY + 0.1,
      w: 3.65,
      h: 0.45,
      fontSize: 8,
      color: KELP_COLORS.textDark,
      valign: 'middle',
      fontFace: 'Arial',
    });
    storyY += 0.75;
  });

  // Global Presence section
  addSectionHeader(slide, 'Global Presence', 5.95, 3.0, 3.85);

  // PIE CHART for Export/Domestic split
  slide.addChart('pie', [
    {
      name: 'Sales',
      labels: ['Export', 'Domestic'],
      values: [72, 28],
    }
  ], {
    x: 5.95,
    y: 3.4,
    w: 1.6,
    h: 1.5,
    chartColors: [KELP_COLORS.primary, KELP_COLORS.orange],
    showLegend: true,
    legendPos: 'b',
    legendFontSize: 7,
    showValue: false,
    showPercent: true,
    showTitle: true,
    title: 'Sales',
    titleFontSize: 9,
    titleBold: true,
  });

  // World map placeholder
  slide.addShape('rect', {
    x: 7.65,
    y: 3.4,
    w: 2.15,
    h: 1.5,
    fill: { color: KELP_COLORS.lightGray },
  });

  // Map marker dots to simulate presence
  const mapDots = [
    { x: 7.9, y: 3.7 },   // USA
    { x: 8.5, y: 3.6 },   // Europe
    { x: 9.0, y: 3.9 },   // India
    { x: 8.8, y: 4.2 },   // SEA
    { x: 8.1, y: 4.3 },   // Brazil
  ];

  mapDots.forEach(dot => {
    slide.addShape('ellipse', {
      x: dot.x,
      y: dot.y,
      w: 0.15,
      h: 0.15,
      fill: { color: KELP_COLORS.primary },
    });
  });

  slide.addText('🌍 Global Presence Map', {
    x: 7.65,
    y: 4.6,
    w: 2.15,
    h: 0.25,
    fontSize: 7,
    color: KELP_COLORS.textMuted,
    align: 'center',
    fontFace: 'Arial',
  });

  // Global presence text
  const presence = companyData?.globalPresence || ['USA', 'Europe', 'Middle East', 'Asia Pacific'];
  slide.addText(`Markets: ${presence.slice(0, 4).join(', ')}`, {
    x: 5.95,
    y: 4.95,
    w: 3.85,
    h: 0.2,
    fontSize: 7,
    color: KELP_COLORS.textMuted,
    fontFace: 'Arial',
  });

  addFooter(slide);
}

// Slide 4: Investment Highlights
function createInvestmentHighlightsSlide(pres: pptxgen, data: EnhancedSlideData) {
  const slide = pres.addSlide();
  const teaser = data.teaser;
  const slideData = teaser.slides[2];

  // Header bar
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.55,
    fill: { color: KELP_COLORS.navy },
  });

  slide.addText('Investment Highlights', {
    x: 0.3,
    y: 0.12,
    w: 5,
    h: 0.35,
    fontSize: 20,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  addKelpLogo(slide, 8.5, 0.12);

  // Decorative circle on left
  slide.addShape('ellipse', {
    x: 0.2,
    y: 1.0,
    w: 3.0,
    h: 3.0,
    fill: { color: KELP_COLORS.primary },
    line: { color: KELP_COLORS.navy, width: 3 },
  });

  // Network pattern dots inside circle
  const dotPositions = [
    [1.1, 1.7], [1.6, 1.4], [2.1, 1.8], [1.3, 2.2], [1.8, 2.5],
    [0.9, 2.0], [2.3, 2.2], [1.2, 2.8], [1.7, 3.0], [2.0, 1.6]
  ];
  
  dotPositions.forEach(([x, y]) => {
    slide.addShape('ellipse', {
      x, y,
      w: 0.1,
      h: 0.1,
      fill: { color: KELP_COLORS.white, transparency: 40 },
    });
  });

  // Investment highlights (right side)
  const bullets = data.enhancedContent?.investmentHighlights?.map(h => `${h.title}: ${h.description}`) 
    || slideData?.content.bullets 
    || [
      'Market Leader: Dominant position in core markets',
      'Diversified Revenue: Multiple product lines and customer segments',
      'Strong Margins: Industry-leading profitability',
      'Growth Platform: Expansion into new markets',
      'Asset Light: Efficient capital deployment',
    ];
  
  const icons = ['🌱', '🔗', '🏭', '🌍', '📈'];
  
  let highlightY = 0.75;
  bullets.slice(0, 5).forEach((bullet, idx) => {
    // Icon circle
    slide.addShape('ellipse', {
      x: 3.5,
      y: highlightY,
      w: 0.4,
      h: 0.4,
      fill: { color: KELP_COLORS.primary },
    });
    slide.addText(icons[idx] || '✓', {
      x: 3.54,
      y: highlightY + 0.06,
      w: 0.32,
      h: 0.28,
      fontSize: 11,
      align: 'center',
    });

    // Highlight box
    slide.addShape('rect', {
      x: 4.05,
      y: highlightY,
      w: 5.75,
      h: 0.62,
      fill: { color: KELP_COLORS.white },
      line: { color: KELP_COLORS.primary, width: 1, dashType: 'dash' },
    });

    slide.addText(bullet, {
      x: 4.15,
      y: highlightY + 0.08,
      w: 5.55,
      h: 0.46,
      fontSize: 9,
      color: KELP_COLORS.textDark,
      valign: 'middle',
      fontFace: 'Arial',
    });

    highlightY += 0.72;
  });

  // Growth Trajectory section
  if (data.futurePlans.length > 0) {
    addSectionHeader(slide, 'Growth Trajectory', 4.05, 4.5, 5.75, KELP_COLORS.orange);

    let planX = 4.15;
    data.futurePlans.slice(0, 2).forEach((plan) => {
      const displayText = plan.length > 85 ? plan.slice(0, 82) + '...' : plan;
      slide.addText(`→ ${displayText}`, {
        x: planX,
        y: 4.88,
        w: 2.75,
        h: 0.35,
        fontSize: 8,
        color: KELP_COLORS.textMuted,
        fontFace: 'Arial',
      });
      planX += 2.85;
    });
  }

  addFooter(slide);
}
