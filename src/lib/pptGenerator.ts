import pptxgen from 'pptxgenjs';
import { TeaserOutput, FinancialData, KeyMetric } from '@/types/company';

// Kelp Brand Colors
const KELP_COLORS = {
  darkIndigo: '1E1B4B',
  indigoLight: '312E81',
  pink: 'F472B6',
  orange: 'FB923C',
  white: 'FFFFFF',
  darkBlue: '0F172A',
  navy: '1E3A5A',
  accent: '0EA5E9',
  lightGray: 'F1F5F9',
  textDark: '334155',
  textMuted: '64748B',
};

interface SlideData {
  teaser: TeaserOutput;
  futurePlans: string[];
  projectName?: string;
}

export async function generatePowerPoint(data: SlideData): Promise<void> {
  const pres = new pptxgen();

  // Set presentation metadata
  pres.author = 'Kelp M&A Team';
  pres.company = 'Kelp';
  pres.subject = 'Investment Brief';
  pres.title = `${data.projectName || 'Project Apex'} - Investment Brief`;
  pres.layout = 'LAYOUT_16x9';

  // Create all 4 slides
  createCoverSlide(pres, data.projectName || 'Project Apex');
  createBusinessOverviewSlide(pres, data.teaser);
  createFinancialsSlide(pres, data.teaser);
  createInvestmentHighlightsSlide(pres, data.teaser, data.futurePlans);

  // Generate filename with date
  const filename = `${data.projectName || 'Investment_Teaser'}_${new Date().toISOString().split('T')[0]}.pptx`;
  
  await pres.writeFile({ fileName: filename });
}

function addKelpLogo(slide: pptxgen.Slide, x: number = 0.5, y: number = 0.3) {
  // Kelp logo as text with icon approximation
  slide.addText([
    { text: '❖ ', options: { color: KELP_COLORS.pink, fontSize: 24, bold: true } },
    { text: 'Kelp', options: { color: KELP_COLORS.white, fontSize: 24, bold: true, fontFace: 'Arial' } }
  ], { x, y, w: 2, h: 0.5 });
}

function addFooter(slide: pptxgen.Slide) {
  slide.addText('Strictly Private & Confidential – Prepared by Kelp M&A Team', {
    x: 0,
    y: 5.3,
    w: '100%',
    h: 0.3,
    fontSize: 8,
    color: KELP_COLORS.textMuted,
    align: 'center',
  });
}

function createCoverSlide(pres: pptxgen, projectName: string) {
  const slide = pres.addSlide();

  // Left dark blue stripe
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 0.8,
    h: '100%',
    fill: { color: KELP_COLORS.darkBlue },
  });

  // Main gradient background
  slide.addShape('rect', {
    x: 0.8,
    y: 0,
    w: 9.2,
    h: '100%',
    fill: { 
      type: 'solid',
      color: KELP_COLORS.darkIndigo,
    },
  });

  // Decorative diagonal shapes (pink overlay)
  slide.addShape('rect', {
    x: 1,
    y: 0,
    w: 5,
    h: 3,
    fill: { color: KELP_COLORS.pink, transparency: 70 },
    rotate: -15,
  });

  // Kelp Logo
  addKelpLogo(slide, 1.5, 0.6);

  // Project Name
  slide.addText(projectName, {
    x: 1.5,
    y: 1.5,
    w: 7,
    h: 1.5,
    fontSize: 54,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  // Investment Brief subtitle
  slide.addText('Investment Brief', {
    x: 1.5,
    y: 4.2,
    w: 4,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  slide.addText('kelpglobal.com', {
    x: 1.5,
    y: 4.7,
    w: 4,
    h: 0.4,
    fontSize: 14,
    italic: true,
    color: KELP_COLORS.lightGray,
    fontFace: 'Arial',
  });

  // Decorative dot pattern (right side)
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 6; col++) {
      slide.addShape('ellipse', {
        x: 7.5 + col * 0.25,
        y: 1 + row * 0.35,
        w: 0.08,
        h: 0.08,
        fill: { color: KELP_COLORS.white, transparency: 80 },
      });
    }
  }
}

function createBusinessOverviewSlide(pres: pptxgen, teaser: TeaserOutput) {
  const slide = pres.addSlide();
  const slideData = teaser.slides[0];

  // Header bar
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.6,
    fill: { color: KELP_COLORS.navy },
  });

  slide.addText('Business Overview', {
    x: 0.3,
    y: 0.1,
    w: 5,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  // Kelp logo in header
  slide.addText([
    { text: '❖ ', options: { color: KELP_COLORS.pink, fontSize: 16, bold: true } },
    { text: 'Kelp', options: { color: KELP_COLORS.white, fontSize: 16, bold: true } }
  ], { x: 8.5, y: 0.15, w: 1.3, h: 0.3 });

  // Business Overview section header
  slide.addShape('rect', {
    x: 0.3,
    y: 0.85,
    w: 5.2,
    h: 0.35,
    fill: { color: KELP_COLORS.accent },
    line: { color: KELP_COLORS.accent },
  });

  slide.addText('Business Overview:', {
    x: 0.4,
    y: 0.88,
    w: 5,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: KELP_COLORS.white,
  });

  // Business overview bullets
  const bullets = slideData.content.bullets || [];
  let yPos = 1.35;
  bullets.forEach((bullet, idx) => {
    slide.addText(`■ ${bullet}`, {
      x: 0.4,
      y: yPos,
      w: 5,
      h: 0.45,
      fontSize: 9,
      color: KELP_COLORS.textDark,
      valign: 'top',
      wrap: true,
    });
    yPos += 0.5;
  });

  // Product Portfolio header
  slide.addShape('rect', {
    x: 0.3,
    y: 3.4,
    w: '95%',
    h: 0.35,
    fill: { color: KELP_COLORS.accent },
  });

  slide.addText('Growth led through its growing product portfolio and offering solutions to diverse sectors', {
    x: 0.4,
    y: 3.43,
    w: 9,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: KELP_COLORS.white,
  });

  // Key Select Customers header (right side)
  slide.addShape('rect', {
    x: 5.7,
    y: 0.85,
    w: 2.2,
    h: 0.35,
    fill: { color: KELP_COLORS.accent },
  });

  slide.addText('Key Select Customers', {
    x: 5.8,
    y: 0.88,
    w: 2,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: KELP_COLORS.white,
  });

  // Gamma at a glance header (far right)
  slide.addShape('rect', {
    x: 8.1,
    y: 0.85,
    w: 1.7,
    h: 0.35,
    fill: { color: KELP_COLORS.orange },
  });

  slide.addText('At a Glance', {
    x: 8.2,
    y: 0.88,
    w: 1.5,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: KELP_COLORS.white,
  });

  // At a Glance metrics
  const metrics = teaser.slides[1]?.content.metrics || [];
  let metricY = 1.35;
  metrics.slice(0, 4).forEach((metric) => {
    slide.addText(`📊 ${metric.label}`, {
      x: 8.2,
      y: metricY,
      w: 1.6,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: KELP_COLORS.accent,
    });
    slide.addText(`${metric.value}${metric.unit ? ' ' + metric.unit : ''}`, {
      x: 8.2,
      y: metricY + 0.25,
      w: 1.6,
      h: 0.3,
      fontSize: 9,
      color: KELP_COLORS.textMuted,
    });
    metricY += 0.6;
  });

  // Product Portfolio boxes
  const products = ['Product Line 1', 'Product Line 2', 'Product Line 3', 'Product Line 4'];
  let prodX = 0.5;
  products.forEach((prod, idx) => {
    slide.addShape('rect', {
      x: prodX,
      y: 3.9,
      w: 1.6,
      h: 0.45,
      fill: { color: 'FFFFFF' },
      line: { color: KELP_COLORS.accent, width: 1.5, dashType: 'dash' },
    });
    slide.addText(prod, {
      x: prodX + 0.1,
      y: 3.95,
      w: 1.4,
      h: 0.35,
      fontSize: 8,
      color: KELP_COLORS.textDark,
      align: 'center',
    });
    prodX += 1.7;
  });

  // Applications icons row
  const applications = ['Industry 1', 'Industry 2', 'Industry 3', 'Industry 4'];
  let appX = 0.5;
  applications.forEach((app) => {
    slide.addText(`🏭 ${app}`, {
      x: appX,
      y: 4.5,
      w: 1.5,
      h: 0.4,
      fontSize: 8,
      color: KELP_COLORS.accent,
      align: 'center',
    });
    appX += 1.7;
  });

  addFooter(slide);
}

function createFinancialsSlide(pres: pptxgen, teaser: TeaserOutput) {
  const slide = pres.addSlide();

  // Header bar
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.6,
    fill: { color: KELP_COLORS.navy },
  });

  slide.addText('Key Financial Metrics and Growth Story', {
    x: 0.3,
    y: 0.1,
    w: 6,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  // Kelp logo in header
  slide.addText([
    { text: '❖ ', options: { color: KELP_COLORS.pink, fontSize: 16, bold: true } },
    { text: 'Kelp', options: { color: KELP_COLORS.white, fontSize: 16, bold: true } }
  ], { x: 8.5, y: 0.15, w: 1.3, h: 0.3 });

  // Key Financial Metrics header
  slide.addShape('rect', {
    x: 0.3,
    y: 0.85,
    w: 5.5,
    h: 0.35,
    fill: { color: KELP_COLORS.orange },
  });

  slide.addText('Key Financial Metrics (Latest FY)', {
    x: 0.4,
    y: 0.88,
    w: 5.3,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: KELP_COLORS.white,
  });

  // KPI Boxes
  const metrics = teaser.slides[1]?.content.metrics || [];
  const kpiData = [
    { label: metrics[0]?.label || 'Revenue', value: String(metrics[0]?.value || 'N/A'), color: KELP_COLORS.orange },
    { label: 'EBITDA Margin', value: metrics[1]?.change ? `${metrics[1].change}%` : '~20%', color: KELP_COLORS.accent },
    { label: 'RoCE', value: '25%+', color: KELP_COLORS.pink },
    { label: 'Debt Status', value: 'Low', color: 'F59E0B' },
  ];

  let kpiX = 0.4;
  kpiData.forEach((kpi) => {
    slide.addShape('rect', {
      x: kpiX,
      y: 1.35,
      w: 1.3,
      h: 0.7,
      fill: { color: kpi.color },
    });
    slide.addText(kpi.value, {
      x: kpiX,
      y: 1.4,
      w: 1.3,
      h: 0.35,
      fontSize: 14,
      bold: true,
      color: KELP_COLORS.white,
      align: 'center',
    });
    slide.addText(kpi.label, {
      x: kpiX,
      y: 1.75,
      w: 1.3,
      h: 0.25,
      fontSize: 8,
      color: KELP_COLORS.white,
      align: 'center',
    });
    kpiX += 1.4;
  });

  // Revenue chart
  const chartData = teaser.charts.revenueData || [];
  if (chartData.length > 0) {
    const chartLabels = chartData.map(d => String(d.year));
    const revenueValues = chartData.map(d => d.revenue || 0);
    const ebitdaValues = chartData.map(d => d.ebitda || 0);
    const patValues = chartData.map(d => d.pat || 0);

    slide.addChart('bar', [
      { name: 'Revenue', labels: chartLabels, values: revenueValues },
      { name: 'EBITDA', labels: chartLabels, values: ebitdaValues },
      { name: 'PAT', labels: chartLabels, values: patValues },
    ], {
      x: 0.3,
      y: 2.2,
      w: 5.5,
      h: 2.8,
      barDir: 'bar',
      barGrouping: 'clustered',
      chartColors: [KELP_COLORS.darkIndigo, KELP_COLORS.accent, KELP_COLORS.pink],
      showValue: true,
      valAxisMaxVal: Math.max(...revenueValues) * 1.2,
      catAxisTitle: 'Year',
      valAxisTitle: 'Amount (Cr)',
      showLegend: true,
      legendPos: 'b',
    });
  }

  // Right side - Growth Story boxes
  const storyBoxes = [
    'Strong revenue growth driven by market expansion and product innovation',
    'Improving margins through operational efficiency and scale',
    'Strategic investments in capacity expansion and R&D',
  ];

  let storyY = 0.9;
  storyBoxes.forEach((story) => {
    slide.addShape('rect', {
      x: 6,
      y: storyY,
      w: 3.8,
      h: 0.65,
      fill: { color: 'FEF3C7' },
      line: { color: KELP_COLORS.orange, width: 1 },
    });
    slide.addText(story, {
      x: 6.1,
      y: storyY + 0.1,
      w: 3.6,
      h: 0.5,
      fontSize: 9,
      color: KELP_COLORS.textDark,
      valign: 'top',
      wrap: true,
    });
    storyY += 0.75;
  });

  // Global Presence header
  slide.addShape('rect', {
    x: 6,
    y: 3.4,
    w: 3.8,
    h: 0.35,
    fill: { color: KELP_COLORS.accent },
  });

  slide.addText('Global Presence', {
    x: 6.1,
    y: 3.43,
    w: 3.6,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: KELP_COLORS.white,
  });

  // Sales split indicators
  slide.addText('📊 Export: 30% | Domestic: 70%', {
    x: 6.1,
    y: 3.9,
    w: 3.6,
    h: 0.4,
    fontSize: 11,
    color: KELP_COLORS.textDark,
  });

  addFooter(slide);
}

function createInvestmentHighlightsSlide(pres: pptxgen, teaser: TeaserOutput, futurePlans: string[]) {
  const slide = pres.addSlide();
  const slideData = teaser.slides[2];

  // Header bar
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.6,
    fill: { color: KELP_COLORS.navy },
  });

  slide.addText('Investment Highlights', {
    x: 0.3,
    y: 0.1,
    w: 5,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  // Kelp logo in header
  slide.addText([
    { text: '❖ ', options: { color: KELP_COLORS.pink, fontSize: 16, bold: true } },
    { text: 'Kelp', options: { color: KELP_COLORS.white, fontSize: 16, bold: true } }
  ], { x: 8.5, y: 0.15, w: 1.3, h: 0.3 });

  // Left decorative circle
  slide.addShape('ellipse', {
    x: 0.3,
    y: 1.2,
    w: 3.5,
    h: 3.5,
    fill: { color: KELP_COLORS.accent },
    line: { color: KELP_COLORS.darkIndigo, width: 3 },
  });

  // Network pattern in circle (approximation)
  for (let i = 0; i < 5; i++) {
    slide.addShape('ellipse', {
      x: 1 + Math.random() * 1.5,
      y: 2 + Math.random() * 1.5,
      w: 0.15,
      h: 0.15,
      fill: { color: KELP_COLORS.white, transparency: 50 },
    });
  }

  // Investment highlights (right side)
  const bullets = slideData?.content.bullets || [];
  const icons = ['🌱', '🔗', '🏭', '🌍', '📈'];
  
  let highlightY = 0.9;
  bullets.slice(0, 5).forEach((bullet, idx) => {
    // Icon circle
    slide.addShape('ellipse', {
      x: 4,
      y: highlightY,
      w: 0.5,
      h: 0.5,
      fill: { color: KELP_COLORS.accent },
    });
    slide.addText(icons[idx] || '✓', {
      x: 4.05,
      y: highlightY + 0.1,
      w: 0.4,
      h: 0.3,
      fontSize: 14,
      align: 'center',
    });

    // Highlight box
    slide.addShape('rect', {
      x: 4.6,
      y: highlightY,
      w: 5.2,
      h: 0.7,
      fill: { color: 'FFFFFF' },
      line: { color: KELP_COLORS.accent, width: 1, dashType: 'dash' },
    });

    slide.addText(bullet, {
      x: 4.7,
      y: highlightY + 0.1,
      w: 5,
      h: 0.5,
      fontSize: 10,
      color: KELP_COLORS.textDark,
      valign: 'middle',
      wrap: true,
    });

    highlightY += 0.85;
  });

  // Future Plans section (if available)
  if (futurePlans.length > 0) {
    slide.addShape('rect', {
      x: 4.6,
      y: 4.5,
      w: 5.2,
      h: 0.35,
      fill: { color: KELP_COLORS.orange },
    });
    slide.addText('Growth Trajectory', {
      x: 4.7,
      y: 4.53,
      w: 5,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: KELP_COLORS.white,
    });

    let planX = 4.7;
    futurePlans.slice(0, 2).forEach((plan) => {
      slide.addText(`→ ${plan.slice(0, 80)}...`, {
        x: planX,
        y: 4.95,
        w: 2.5,
        h: 0.4,
        fontSize: 8,
        color: KELP_COLORS.textMuted,
        wrap: true,
      });
      planX += 2.6;
    });
  }

  addFooter(slide);
}
