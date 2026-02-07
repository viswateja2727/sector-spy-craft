

# Kelp Automated Deal Flow - Investment Teaser Generator

## Overview
A visually polished web application that transforms company data files into beautiful, anonymized investment teaser presentations with structured JSON output for external PPT generation. The app will feature Kelp's branding, sector-aware intelligence, and professional slide previews.

---

## Phase 1: Core Upload & Processing Interface

### 1.1 Landing Page
- Kelp-branded hero section with gradient accents (dark indigo → pink/orange)
- Drag-and-drop upload zone for markdown/Excel company files
- Clear CTA: "Generate Investment Teaser"

### 1.2 File Processing Engine
- Parse uploaded markdown files extracting key sections:
  - Business Description, Products/Services
  - Key Operational Indicators, Financials
  - SWOT Analysis, Market Size, Milestones
- Validate required data fields
- Display processing status with animated progress

---

## Phase 2: AI-Powered Intelligence Layer

### 2.1 Sector Detection
- Analyze template type header and business description
- Classify into sectors: Manufacturing, Consumer/D2C, Tech/Electronics, Pharma, Logistics
- Display confidence score with sector badge

### 2.2 Content Extraction & Anonymization
- Use Lovable AI (via edge function) to:
  - Extract top investment highlights based on sector
  - Rewrite content into anonymous, compelling bullet points
  - Remove company names, founder names, specific locations
  - Preserve all numerical data and financial metrics

### 2.3 Sector-Specific Metric Selection
- **Manufacturing**: Revenue, EBITDA margins, export %, facilities, certifications, order book
- **Consumer**: Revenue growth, occupancy, ticket price, F&B spend, YoY growth
- **Electronics/Defense**: Order book value, DRDO/ISRO clients, production area, R&D focus

---

## Phase 3: Visual Slide Builder (Focus Area)

### 3.1 Three-Slide Teaser Preview

**Slide 1: Business Profile & Infrastructure**
- Layout: 60% hero image area | 40% text
- Kelp header with logo
- 4 anonymized bullet points (products, markets, positioning)
- Sector-relevant stock image placeholder
- Footer: "Strictly Private & Confidential"

**Slide 2: Financial & Operational Scale**
- Interactive bar/line charts (Recharts - already installed)
  - Revenue trajectory (3-year trend)
  - EBITDA margins visualization
- Metrics grid: 6-8 KPIs in styled cards
- Growth annotations with arrows

**Slide 3: Investment Highlights**
- Three-column value proposition layout:
  - "High Entry Barriers"
  - "Operational Excellence"  
  - "Market Opportunity"
- SWOT-derived strengths as compelling one-liners
- Future plans as growth narrative

### 3.2 Kelp Branding System
- Color palette: Dark indigo primary, pink-orange gradient accents
- Typography: Clean headings, readable body text
- Consistent footer on all slides
- Professional slide transitions/animations

---

## Phase 4: Structured JSON Export

### 4.1 Export Schema
```json
{
  "metadata": {
    "sector": "Manufacturing",
    "generated_at": "2026-02-05",
    "source_file": "Kalyani_Forge.md"
  },
  "slides": [
    {
      "slide_number": 1,
      "type": "business_profile",
      "content": {
        "headline": "Leading Engineering Solutions Provider",
        "bullets": ["...", "...", "..."],
        "image_keywords": ["forging plant", "industrial facility"]
      }
    },
    // ... slides 2-3
  ],
  "charts": {
    "revenue_data": [...],
    "margins_data": [...]
  },
  "citations": [...]
}
```

### 4.2 Download Options
- JSON download button (for external PPT tools)
- Copy to clipboard functionality
- Optional: Print-to-PDF of slide preview

---

## Phase 5: Citation Tracking

### 5.1 Source Mapping
- Track every extracted claim to its source section
- Display citation badges on hover
- Generate citations document:
  ```
  Claim: "Revenue grew 59% YoY"
  Source: "Financials Status > Income Statement > Revenue From Operations"
  ```

### 5.2 Citation Export
- Downloadable citations report (markdown/text)
- Linked to each slide's claims

---

## Phase 6: Polish & UX Excellence

### 6.1 Responsive Design
- Desktop-optimized slide preview
- Mobile-friendly upload flow

### 6.2 Visual Enhancements
- Animated slide transitions
- Loading skeletons during AI processing
- Success/error toasts
- Confetti on successful generation

### 6.3 Multi-Company Support
- Process multiple files in sequence
- Gallery view of generated teasers
- Compare companies side-by-side

---

## Technical Implementation

### Backend (Lovable Cloud)
- Edge function for Lovable AI integration
- Prompts engineered for:
  - Sector detection
  - Content anonymization
  - Highlight extraction

### Frontend
- React components for slide templates
- Recharts for financial visualizations
- Tailwind + shadcn/ui for consistent styling
- File parser for markdown structure

---

## Deliverables

1. **Upload Interface** - Kelp-branded, drag-drop file upload
2. **AI Processing** - Sector detection + anonymized content generation
3. **Slide Preview** - 3 beautiful, interactive slide previews
4. **Charts** - Native Recharts visualizations (revenue, margins)
5. **JSON Export** - Structured output for external PPT generation
6. **Citations** - Full source tracking for every claim

