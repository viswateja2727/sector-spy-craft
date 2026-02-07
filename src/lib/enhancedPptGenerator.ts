import pptxgen from 'pptxgenjs';
import { TeaserOutput, FinancialData } from '@/types/company';

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
  cyan: '06B6D4',
  yellow: 'FCD34D',
};

export interface EnhancedSlideData {
  teaser: TeaserOutput;
  futurePlans: string[];
  projectName: string;
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

export async function generateEnhancedPowerPoint(data: EnhancedSlideData): Promise<void> {
  const pres = new pptxgen();

  // Set presentation metadata
  pres.author = 'Kelp M&A Team';
  pres.company = 'Kelp';
  pres.subject = 'Investment Brief';
  pres.title = `${data.projectName} - Investment Brief`;
  pres.layout = 'LAYOUT_16x9';

  // Create all 4 slides
  await createCoverSlide(pres, data.projectName, data.enhancedContent?.imageUrls?.[0]);
  await createBusinessOverviewSlide(pres, data.teaser, data.enhancedContent);
  await createFinancialsSlide(pres, data.teaser, data.enhancedContent);
  await createInvestmentHighlightsSlide(pres, data.teaser, data.futurePlans, data.enhancedContent);

  // Generate filename with date
  const filename = `${data.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pptx`;
  
  await pres.writeFile({ fileName: filename });
}

function addKelpLogo(slide: pptxgen.Slide, x: number = 0.5, y: number = 0.3, darkBg: boolean = true) {
  const textColor = darkBg ? KELP_COLORS.white : KELP_COLORS.darkIndigo;
  slide.addText([
    { text: '❖ ', options: { color: KELP_COLORS.pink, fontSize: 18, bold: true } },
    { text: 'Kelp', options: { color: textColor, fontSize: 18, bold: true, fontFace: 'Arial' } }
  ], { x, y, w: 1.5, h: 0.4 });
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

async function createCoverSlide(pres: pptxgen, projectName: string, imageUrl?: string) {
  const slide = pres.addSlide();

  // Full gradient background
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: '100%',
    fill: { color: KELP_COLORS.darkIndigo },
  });

  // Left accent stripe
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 0.6,
    h: '100%',
    fill: { color: KELP_COLORS.darkBlue },
  });

  // Decorative overlay (diagonal gradient effect)
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 6,
    h: 4,
    fill: { color: KELP_COLORS.pink, transparency: 85 },
    rotate: -10,
  });

  // Add background image if available
  if (imageUrl) {
    try {
      slide.addImage({
        path: imageUrl,
        x: 5,
        y: 0,
        w: 5,
        h: 5.63,
        sizing: { type: 'cover', w: 5, h: 5.63 },
      });
      // Add overlay for readability
      slide.addShape('rect', {
        x: 5,
        y: 0,
        w: 5,
        h: 5.63,
        fill: { color: KELP_COLORS.darkIndigo, transparency: 60 },
      });
    } catch (e) {
      console.log('Could not add cover image:', e);
    }
  }

  // Kelp Logo
  addKelpLogo(slide, 1.2, 0.5);

  // Project Name
  slide.addText(projectName, {
    x: 1.2,
    y: 1.8,
    w: 7,
    h: 1.2,
    fontSize: 48,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  // Subtitle
  slide.addText('Investment Brief', {
    x: 1.2,
    y: 3.2,
    w: 4,
    h: 0.6,
    fontSize: 24,
    color: KELP_COLORS.lightGray,
    fontFace: 'Arial',
  });

  // Website
  slide.addText('kelpglobal.com', {
    x: 1.2,
    y: 4.5,
    w: 3,
    h: 0.4,
    fontSize: 14,
    italic: true,
    color: KELP_COLORS.accent,
    fontFace: 'Arial',
  });

  // Dot pattern decoration
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 5; col++) {
      slide.addShape('ellipse', {
        x: 8 + col * 0.22,
        y: 0.8 + row * 0.3,
        w: 0.06,
        h: 0.06,
        fill: { color: KELP_COLORS.white, transparency: 75 },
      });
    }
  }
}

async function createBusinessOverviewSlide(
  pres: pptxgen, 
  teaser: TeaserOutput, 
  enhancedContent?: EnhancedSlideData['enhancedContent']
) {
  const slide = pres.addSlide();
  const slideData = teaser.slides[0];

  // Header bar
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.55,
    fill: { color: KELP_COLORS.navy },
  });

  slide.addText('Business Overview', {
    x: 0.3,
    y: 0.12,
    w: 5,
    h: 0.35,
    fontSize: 20,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  addKelpLogo(slide, 8.3, 0.1);

  // Business Overview section
  slide.addShape('rect', {
    x: 0.3,
    y: 0.75,
    w: 5.3,
    h: 0.32,
    fill: { color: KELP_COLORS.accent },
  });

  slide.addText('Business Overview:', {
    x: 0.4,
    y: 0.77,
    w: 5,
    h: 0.28,
    fontSize: 11,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  // Business bullets - use enhanced content if available
  const bullets = enhancedContent?.businessOverview?.bullets || slideData.content.bullets || [];
  let yPos = 1.2;
  bullets.slice(0, 5).forEach((bullet) => {
    slide.addText([
      { text: '■ ', options: { color: KELP_COLORS.accent, fontSize: 10 } },
      { text: bullet, options: { color: KELP_COLORS.textDark, fontSize: 10, fontFace: 'Arial' } }
    ], {
      x: 0.4,
      y: yPos,
      w: 5.1,
      h: 0.45,
      valign: 'top',
      paraSpaceAfter: 4,
    });
    yPos += 0.48;
  });

  // Key Select Customers section with image
  slide.addShape('rect', {
    x: 5.8,
    y: 0.75,
    w: 2.1,
    h: 0.32,
    fill: { color: KELP_COLORS.accent },
  });

  slide.addText('Key Select Customers', {
    x: 5.9,
    y: 0.77,
    w: 2,
    h: 0.28,
    fontSize: 10,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  // Add sector image if available
  const imageUrl = enhancedContent?.imageUrls?.[1];
  if (imageUrl) {
    slide.addImage({
      path: imageUrl,
      x: 5.8,
      y: 1.15,
      w: 2.1,
      h: 1.8,
      sizing: { type: 'cover', w: 2.1, h: 1.8 },
    });
  } else {
    // Placeholder if no image
    slide.addShape('rect', {
      x: 5.8,
      y: 1.15,
      w: 2.1,
      h: 1.8,
      fill: { color: KELP_COLORS.lightGray },
      line: { color: KELP_COLORS.accent, width: 0.5, dashType: 'dash' },
    });
    slide.addText('Customer logos\nto be added', {
      x: 5.9,
      y: 1.7,
      w: 1.9,
      h: 0.6,
      fontSize: 9,
      color: KELP_COLORS.textMuted,
      align: 'center',
      fontFace: 'Arial',
    });
  }

  // At a Glance section
  slide.addShape('rect', {
    x: 8.1,
    y: 0.75,
    w: 1.7,
    h: 0.32,
    fill: { color: KELP_COLORS.orange },
  });

  slide.addText('At a Glance', {
    x: 8.2,
    y: 0.77,
    w: 1.5,
    h: 0.28,
    fontSize: 10,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  // At a Glance metrics
  const metrics = teaser.slides[1]?.content.metrics || [];
  let metricY = 1.15;
  metrics.slice(0, 4).forEach((metric) => {
    slide.addText('📊', { x: 8.1, y: metricY, w: 0.3, h: 0.25, fontSize: 10 });
    slide.addText(metric.label, {
      x: 8.4,
      y: metricY,
      w: 1.4,
      h: 0.22,
      fontSize: 10,
      bold: true,
      color: KELP_COLORS.accent,
      fontFace: 'Arial',
    });
    slide.addText(`${metric.value}${metric.unit ? ' ' + metric.unit : ''}`, {
      x: 8.4,
      y: metricY + 0.22,
      w: 1.4,
      h: 0.22,
      fontSize: 9,
      color: KELP_COLORS.textDark,
      fontFace: 'Arial',
    });
    metricY += 0.55;
  });

  // Product Portfolio section
  slide.addShape('rect', {
    x: 0.3,
    y: 3.55,
    w: 9.5,
    h: 0.32,
    fill: { color: KELP_COLORS.accent },
  });

  slide.addText('Growth led through its growing product portfolio and offering solutions to diverse sectors', {
    x: 0.4,
    y: 3.57,
    w: 9.3,
    h: 0.28,
    fontSize: 10,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  // Product boxes
  const products = ['Product Line 1', 'Product Line 2', 'Product Line 3', 'Product Line 4'];
  let prodX = 0.4;
  products.forEach((prod) => {
    slide.addShape('rect', {
      x: prodX,
      y: 4.0,
      w: 2.2,
      h: 0.5,
      fill: { color: KELP_COLORS.white },
      line: { color: KELP_COLORS.accent, width: 1.5, dashType: 'dash' },
    });
    slide.addText(prod, {
      x: prodX + 0.1,
      y: 4.1,
      w: 2,
      h: 0.3,
      fontSize: 9,
      color: KELP_COLORS.textDark,
      align: 'center',
      fontFace: 'Arial',
    });
    prodX += 2.35;
  });

  // Industry icons
  const industries = ['Industry 1', 'Industry 2', 'Industry 3', 'Industry 4'];
  let indX = 0.6;
  industries.forEach((ind) => {
    slide.addText(`🏭 ${ind}`, {
      x: indX,
      y: 4.65,
      w: 2,
      h: 0.35,
      fontSize: 9,
      color: KELP_COLORS.accent,
      align: 'center',
      fontFace: 'Arial',
    });
    indX += 2.35;
  });

  addFooter(slide);
}

async function createFinancialsSlide(
  pres: pptxgen, 
  teaser: TeaserOutput,
  enhancedContent?: EnhancedSlideData['enhancedContent']
) {
  const slide = pres.addSlide();

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

  addKelpLogo(slide, 8.3, 0.1);

  // Key Financial Metrics header
  slide.addShape('rect', {
    x: 0.3,
    y: 0.75,
    w: 5.5,
    h: 0.32,
    fill: { color: KELP_COLORS.orange },
  });

  slide.addText('Key Financial Metrics (Latest FY)', {
    x: 0.4,
    y: 0.77,
    w: 5.3,
    h: 0.28,
    fontSize: 11,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  // KPI Boxes
  const metrics = teaser.slides[1]?.content.metrics || [];
  const kpiData = [
    { 
      label: 'Employees', 
      value: String(metrics.find(m => m.label === 'Employees')?.value || '955'), 
      color: KELP_COLORS.accent 
    },
    { 
      label: 'EBITDA Margin', 
      value: '~20%', 
      color: KELP_COLORS.pink 
    },
    { 
      label: 'RoCE', 
      value: '25%+', 
      color: KELP_COLORS.cyan 
    },
    { 
      label: 'Debt Status', 
      value: 'Low', 
      color: KELP_COLORS.orange 
    },
  ];

  let kpiX = 0.4;
  kpiData.forEach((kpi) => {
    slide.addShape('rect', {
      x: kpiX,
      y: 1.2,
      w: 1.3,
      h: 0.75,
      fill: { color: kpi.color },
    });
    slide.addText(kpi.value, {
      x: kpiX,
      y: 1.28,
      w: 1.3,
      h: 0.35,
      fontSize: 16,
      bold: true,
      color: KELP_COLORS.white,
      align: 'center',
      fontFace: 'Arial',
    });
    slide.addText(kpi.label, {
      x: kpiX,
      y: 1.65,
      w: 1.3,
      h: 0.25,
      fontSize: 8,
      color: KELP_COLORS.white,
      align: 'center',
      fontFace: 'Arial',
    });
    kpiX += 1.4;
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
        y: 2.1,
        w: 5.5,
        h: 2.9,
        barDir: 'bar',
        barGrouping: 'clustered',
        chartColors: [KELP_COLORS.pink, KELP_COLORS.accent, KELP_COLORS.darkIndigo],
        showValue: true,
        dataLabelFontSize: 8,
        dataLabelColor: KELP_COLORS.textDark,
        dataLabelPosition: 'outEnd',
        catAxisTitle: '',
        valAxisTitle: '',
        catAxisLabelFontSize: 9,
        valAxisLabelFontSize: 8,
        showLegend: true,
        legendPos: 'b',
        legendFontSize: 8,
        valAxisMinVal: 0,
      });
    }
  }

  // Growth Story boxes (right side)
  const growthStories = enhancedContent?.growthStory || [
    'Strong revenue growth driven by market expansion and product innovation',
    'Improving margins through operational efficiency and scale',
    'Strategic investments in capacity expansion and R&D',
  ];

  let storyY = 0.75;
  growthStories.slice(0, 3).forEach((story) => {
    slide.addShape('rect', {
      x: 6,
      y: storyY,
      w: 3.8,
      h: 0.7,
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
      valign: 'middle',
      fontFace: 'Arial',
    });
    storyY += 0.8;
  });

  // Global Presence section
  slide.addShape('rect', {
    x: 6,
    y: 3.3,
    w: 3.8,
    h: 0.32,
    fill: { color: KELP_COLORS.accent },
  });

  slide.addText('Global Presence', {
    x: 6.1,
    y: 3.32,
    w: 3.6,
    h: 0.28,
    fontSize: 11,
    bold: true,
    color: KELP_COLORS.white,
    fontFace: 'Arial',
  });

  // Sales split
  slide.addText('📊 Export: 30% | Domestic: 70%', {
    x: 6.1,
    y: 3.75,
    w: 3.6,
    h: 0.35,
    fontSize: 11,
    color: KELP_COLORS.textDark,
    fontFace: 'Arial',
  });

  // World map / Global presence image
  const globalImageUrl = enhancedContent?.imageUrls?.[2];
  if (globalImageUrl) {
    slide.addImage({
      path: globalImageUrl,
      x: 6,
      y: 4.15,
      w: 3.8,
      h: 0.95,
      sizing: { type: 'cover', w: 3.8, h: 0.95 },
    });
  } else {
    slide.addShape('rect', {
      x: 6,
      y: 4.2,
      w: 3.8,
      h: 0.9,
      fill: { color: KELP_COLORS.lightGray },
      line: { color: KELP_COLORS.accent, width: 0.5, dashType: 'dash' },
    });
    slide.addText('🌍 Global presence map', {
      x: 6.1,
      y: 4.5,
      w: 3.6,
      h: 0.35,
      fontSize: 9,
      color: KELP_COLORS.textMuted,
      align: 'center',
      fontFace: 'Arial',
    });
  }

  addFooter(slide);
}

async function createInvestmentHighlightsSlide(
  pres: pptxgen, 
  teaser: TeaserOutput, 
  futurePlans: string[],
  enhancedContent?: EnhancedSlideData['enhancedContent']
) {
  const slide = pres.addSlide();
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

  addKelpLogo(slide, 8.3, 0.1);

  // Decorative circle on left
  slide.addShape('ellipse', {
    x: 0.2,
    y: 1.0,
    w: 3.3,
    h: 3.3,
    fill: { color: KELP_COLORS.accent },
    line: { color: KELP_COLORS.darkIndigo, width: 3 },
  });

  // Network pattern dots inside circle
  const dotPositions = [
    [1.2, 1.8], [1.8, 1.5], [2.3, 2.0], [1.5, 2.4], [2.0, 2.7],
    [1.0, 2.2], [2.5, 2.4], [1.3, 3.0], [1.9, 3.2], [2.2, 1.7]
  ];
  
  dotPositions.forEach(([x, y]) => {
    slide.addShape('ellipse', {
      x, y,
      w: 0.12,
      h: 0.12,
      fill: { color: KELP_COLORS.white, transparency: 40 },
    });
  });

  // Investment highlights (right side) - use enhanced content if available
  const bullets = enhancedContent?.investmentHighlights?.map(h => `${h.title}: ${h.description}`) 
    || slideData?.content.bullets 
    || [];
  
  const icons = ['🌱', '🔗', '🏭', '🌍', '📈'];
  
  let highlightY = 0.8;
  bullets.slice(0, 5).forEach((bullet, idx) => {
    // Icon circle
    slide.addShape('ellipse', {
      x: 3.8,
      y: highlightY,
      w: 0.45,
      h: 0.45,
      fill: { color: KELP_COLORS.accent },
    });
    slide.addText(icons[idx] || '✓', {
      x: 3.85,
      y: highlightY + 0.08,
      w: 0.35,
      h: 0.3,
      fontSize: 12,
      align: 'center',
    });

    // Highlight box
    slide.addShape('rect', {
      x: 4.4,
      y: highlightY,
      w: 5.4,
      h: 0.68,
      fill: { color: KELP_COLORS.white },
      line: { color: KELP_COLORS.accent, width: 1, dashType: 'dash' },
    });

    slide.addText(bullet, {
      x: 4.5,
      y: highlightY + 0.1,
      w: 5.2,
      h: 0.48,
      fontSize: 10,
      color: KELP_COLORS.textDark,
      valign: 'middle',
      fontFace: 'Arial',
    });

    highlightY += 0.8;
  });

  // Growth Trajectory section
  if (futurePlans.length > 0) {
    slide.addShape('rect', {
      x: 4.4,
      y: 4.6,
      w: 5.4,
      h: 0.32,
      fill: { color: KELP_COLORS.orange },
    });
    slide.addText('Growth Trajectory', {
      x: 4.5,
      y: 4.62,
      w: 5.2,
      h: 0.28,
      fontSize: 10,
      bold: true,
      color: KELP_COLORS.white,
      fontFace: 'Arial',
    });

    let planX = 4.5;
    futurePlans.slice(0, 2).forEach((plan) => {
      const displayText = plan.length > 80 ? plan.slice(0, 77) + '...' : plan;
      slide.addText(`→ ${displayText}`, {
        x: planX,
        y: 5.0,
        w: 2.6,
        h: 0.35,
        fontSize: 8,
        color: KELP_COLORS.textMuted,
        fontFace: 'Arial',
      });
      planX += 2.7;
    });
  }

  addFooter(slide);
}
