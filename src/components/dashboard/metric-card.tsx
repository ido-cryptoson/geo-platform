'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatChange, getChangeColor, getScoreColor } from '@/utils/metrics';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  previousValue?: number;
  description?: string;
  type?: 'score' | 'percentage' | 'number' | 'position';
}

export function MetricCard({
  title,
  value,
  suffix = '',
  previousValue,
  description,
  type = 'number',
}: MetricCardProps) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const change = previousValue !== undefined ? numValue - previousValue : undefined;
  const changePercent = previousValue !== undefined && previousValue !== 0
    ? Math.round(((numValue - previousValue) / previousValue) * 100)
    : undefined;

  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="w-4 h-4" />;
    // For position, lower is better
    if (type === 'position') {
      return change < 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    }
    return change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getChangeColorForType = () => {
    if (change === undefined || change === 0) return 'text-gray-500';
    // For position, lower is better
    if (type === 'position') {
      return change < 0 ? 'text-green-600' : 'text-red-600';
    }
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatValue = () => {
    if (type === 'score') {
      return (
        <span className={getScoreColor(numValue)}>
          {numValue}
          <span className="text-2xl">/100</span>
        </span>
      );
    }
    if (type === 'percentage') {
      return `${numValue}%`;
    }
    if (type === 'position') {
      return numValue > 0 ? `#${numValue.toFixed(1)}` : 'N/A';
    }
    return value;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold text-gray-900">
              {formatValue()}
              {suffix && <span className="text-lg ml-1">{suffix}</span>}
            </span>
            {changePercent !== undefined && (
              <div className={`flex items-center gap-1 ${getChangeColorForType()}`}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {type === 'position'
                    ? (change! > 0 ? `+${change!.toFixed(1)}` : change!.toFixed(1))
                    : formatChange(changePercent)}
                </span>
              </div>
            )}
          </div>
          {description && (
            <span className="text-xs text-gray-400">{description}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
