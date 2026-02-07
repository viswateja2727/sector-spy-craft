import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { TeaserSlide, FinancialData, KeyMetric } from '@/types/company';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FinancialScaleSlideProps {
  slide: TeaserSlide;
  revenueData: FinancialData[];
  metrics: KeyMetric[];
}

export function FinancialScaleSlide({ slide, revenueData, metrics }: FinancialScaleSlideProps) {
  const chartData = revenueData.map(d => ({
    year: d.year,
    revenue: d.revenue,
    ebitda: d.ebitda || 0,
  }));

  return (
    <div className="aspect-[16/9] bg-card rounded-xl overflow-hidden slide-shadow flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <SlideHeader title="Financial Overview" />

        <div className="flex-1 flex gap-6 mt-6">
          {/* Charts - 55% */}
          <div className="w-[55%] flex flex-col gap-4">
            <div className="flex-1 bg-muted/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Revenue Trajectory (₹ Cr)</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="url(#revenueGradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(330, 80%, 60%)" />
                      <stop offset="100%" stopColor="hsl(25, 95%, 55%)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {chartData.some(d => d.ebitda > 0) && (
              <div className="h-32 bg-muted/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">EBITDA Trend (₹ Cr)</h3>
                <ResponsiveContainer width="100%" height="75%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="year" 
                      tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ebitda" 
                      stroke="hsl(233, 47%, 20%)" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(233, 47%, 20%)', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Metrics Grid - 45% */}
          <div className="w-[45%] grid grid-cols-2 gap-3 content-start">
            {metrics.slice(0, 8).map((metric, index) => (
              <Card key={index} className="bg-muted/30 border-0">
                <CardContent className="p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                    {metric.label}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-foreground">
                      {metric.value}
                    </span>
                    {metric.unit && (
                      <span className="text-xs text-muted-foreground">{metric.unit}</span>
                    )}
                  </div>
                  {metric.change !== undefined && (
                    <div className={`flex items-center gap-1 mt-1 text-xs ${metric.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {metric.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{Math.abs(metric.change)}% YoY</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <SlideFooter pageNumber={2} />
      </div>
    </div>
  );
}
