import { CompanyData, FinancialData, SWOT } from '@/types/company';

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`## ${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function extractSubSection(content: string, sectionName: string): string {
  const regex = new RegExp(`### ${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function parseListItems(content: string): string[] {
  const lines = content.split('\n');
  return lines
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map(line => line.replace(/^[-*]\s*\*?\*?/, '').replace(/\*?\*?$/, '').trim())
    .filter(item => item.length > 0 && !item.includes('|'));
}

function parseTableToArray(tableContent: string): Record<string, string>[] {
  const lines = tableContent.split('\n').filter(line => line.trim().startsWith('|'));
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split('|')
    .map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
    .filter(h => h.length > 0);

  return lines.slice(2).map(row => {
    const values = row.split('|').map(v => v.trim()).filter(v => v.length > 0);
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

// Parse the special financial format: "- Revenue From Operations | 2014: 2054.23 | 2015: 2408.02..."
function parseFinancialLine(line: string): { metric: string; values: Record<string, number> } | null {
  if (!line.includes('|')) return null;
  
  const parts = line.split('|').map(p => p.trim());
  if (parts.length < 2) return null;

  const metricPart = parts[0].replace(/^[-\s]+/, '').trim();
  const values: Record<string, number> = {};

  for (let i = 1; i < parts.length; i++) {
    const match = parts[i].match(/(\d{4}):\s*([-\d.]+|None)/);
    if (match) {
      const year = match[1];
      const value = match[2] === 'None' ? 0 : parseFloat(match[2]);
      if (!isNaN(value)) {
        values[year] = value;
      }
    }
  }

  return { metric: metricPart, values };
}

function parseFinancials(content: string): CompanyData['financials'] {
  const financialsSection = extractSection(content, 'Financials Status');
  const incomeSection = extractSubSection(financialsSection, 'Income Statement');
  
  const lines = incomeSection.split('\n');
  
  let revenueData: Record<string, number> = {};
  let ebitdaData: Record<string, number> = {};
  let patData: Record<string, number> = {};

  for (const line of lines) {
    const parsed = parseFinancialLine(line);
    if (!parsed) continue;

    const metricLower = parsed.metric.toLowerCase();
    
    if (metricLower.includes('revenue from operations') && !metricLower.includes('sale of')) {
      revenueData = parsed.values;
    } else if (metricLower.includes('operating ebitda')) {
      ebitdaData = parsed.values;
    } else if (metricLower === 'pat') {
      patData = parsed.values;
    }
  }

  // Get all unique years and sort them
  const allYears = [...new Set([
    ...Object.keys(revenueData),
    ...Object.keys(ebitdaData),
    ...Object.keys(patData),
  ])].sort();

  // Take last 5 years
  const recentYears = allYears.slice(-5);

  const incomeStatement: FinancialData[] = recentYears.map(year => ({
    year: `FY${year.slice(-2)}`,
    revenue: revenueData[year] || 0,
    ebitda: ebitdaData[year] || 0,
    pat: patData[year] || 0,
    margins: revenueData[year] ? ((ebitdaData[year] || 0) / revenueData[year] * 100) : 0,
  }));

  return {
    incomeStatement,
    balanceSheet: {},
    cashFlow: {},
  };
}

function parseSWOT(content: string): SWOT {
  const swotSection = extractSection(content, 'SWOT');
  return {
    strengths: parseListItems(extractSubSection(swotSection, 'Strengths')),
    weaknesses: parseListItems(extractSubSection(swotSection, 'Weaknesses')),
    opportunities: parseListItems(extractSubSection(swotSection, 'Opportunities')),
    threats: parseListItems(extractSubSection(swotSection, 'Threats')),
  };
}

function parseMarketSize(content: string): Array<{ market: string; size: string; growth: string }> {
  const section = extractSection(content, 'Market Size');
  const rows = parseTableToArray(section);
  return rows.map(row => ({
    market: row.market || '',
    size: row.current_market_size || '',
    growth: row['growth_(%)'] || row.growth || '',
  }));
}

function parseMilestones(content: string): Array<{ date: string; milestone: string }> {
  const section = extractSection(content, 'Key Milestones');
  const rows = parseTableToArray(section);
  return rows.map(row => ({
    date: row.date || '',
    milestone: row.milestone || '',
  }));
}

function parseClients(content: string): string[] {
  const section = extractSection(content, 'Clients');
  if (!section) return [];
  return section.split(/[\s,]+/).filter(c => c.length > 2);
}

function parseCertifications(content: string): string[] {
  const section = extractSection(content, 'Awards and Certifications');
  return parseListItems(section);
}

function parseDetails(content: string): CompanyData['details'] {
  const section = extractSection(content, 'Details');
  
  const extractField = (field: string): string => {
    const regex = new RegExp(`${field}:\\s*\\*\\*(.+?)\\*\\*`, 'i');
    const match = section.match(regex);
    return match ? match[1].trim() : '';
  };

  const peopleSection = extractSection(content, 'People');
  const employeesMatch = peopleSection.match(/Employees:\s*\*\*(.+?)\*\*/);

  return {
    founded: extractField('Founded'),
    headquarters: extractField('Headquarters'),
    domain: extractField('Domain'),
    segment: extractField('Segment'),
    employees: employeesMatch ? employeesMatch[1] : '',
  };
}

function parseGlobalPresence(content: string): string[] {
  const section = extractSection(content, 'Global Presence');
  return section.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

function parseFuturePlans(content: string): string[] {
  const section = extractSection(content, 'Future Plan');
  return parseListItems(section);
}

function getTemplateType(content: string): string {
  const firstLine = content.split('\n')[0];
  const match = firstLine.match(/Template:\s*(.+)/i);
  if (match) return match[1].trim();
  
  // Try to extract from # header
  const headerMatch = content.match(/^#\s*📄\s*Template:\s*(.+)/m);
  if (headerMatch) return headerMatch[1].trim();
  
  return 'Unknown';
}

export function parseMarkdownFile(content: string, fileName: string): CompanyData {
  const templateType = getTemplateType(content);
  const businessDescription = extractSection(content, 'Business Description');
  const productsSection = extractSection(content, 'Product & Services');
  const applicationsSection = extractSection(content, 'Application areas / Industries served');
  const keyIndicatorsSection = extractSection(content, 'Key Operational Indicators');

  return {
    templateType,
    businessDescription,
    productsServices: parseListItems(productsSection),
    applicationsIndustries: applicationsSection.split(',').map(s => s.trim()).filter(s => s),
    keyOperationalIndicators: parseListItems(keyIndicatorsSection),
    financials: parseFinancials(content),
    swot: parseSWOT(content),
    marketSize: parseMarketSize(content),
    milestones: parseMilestones(content),
    clients: parseClients(content),
    certifications: parseCertifications(content),
    globalPresence: parseGlobalPresence(content),
    futurePlans: parseFuturePlans(content),
    details: parseDetails(content),
  };
}

export function detectSector(data: CompanyData): { sector: string; confidence: number } {
  const templateLower = data.templateType.toLowerCase();
  const descriptionLower = data.businessDescription.toLowerCase();
  const industriesLower = data.applicationsIndustries.join(' ').toLowerCase();

  // Manufacturing keywords
  if (
    templateLower.includes('manufacturing') ||
    descriptionLower.includes('forging') ||
    descriptionLower.includes('machining') ||
    descriptionLower.includes('production') ||
    industriesLower.includes('automotive')
  ) {
    return { sector: 'Manufacturing', confidence: 0.92 };
  }

  // Entertainment/Consumer
  if (
    templateLower.includes('consumer') ||
    descriptionLower.includes('cinema') ||
    descriptionLower.includes('entertainment') ||
    descriptionLower.includes('retail') ||
    descriptionLower.includes('multiplex')
  ) {
    return { sector: 'Consumer/D2C', confidence: 0.88 };
  }

  // Tech/Electronics/Defense
  if (
    templateLower.includes('electronics') ||
    templateLower.includes('technology') ||
    descriptionLower.includes('defense') ||
    descriptionLower.includes('electronics') ||
    descriptionLower.includes('semiconductor') ||
    descriptionLower.includes('aerospace')
  ) {
    return { sector: 'Tech/Electronics', confidence: 0.85 };
  }

  // Pharma
  if (
    templateLower.includes('pharma') ||
    descriptionLower.includes('pharmaceutical') ||
    descriptionLower.includes('healthcare')
  ) {
    return { sector: 'Pharma', confidence: 0.90 };
  }

  // Logistics
  if (
    templateLower.includes('logistics') ||
    descriptionLower.includes('logistics') ||
    descriptionLower.includes('supply chain')
  ) {
    return { sector: 'Logistics', confidence: 0.87 };
  }

  return { sector: 'Manufacturing', confidence: 0.60 };
}
