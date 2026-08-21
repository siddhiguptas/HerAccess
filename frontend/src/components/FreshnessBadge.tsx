import React from 'react';
import { FreshnessLevel } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock } from 'lucide-react';

interface Props {
  level: FreshnessLevel;
  observedAt?: string;
  className?: string;
}

export const FreshnessBadge: React.FC<Props> = ({ level, observedAt, className = '' }) => {
  const formatObservedText = () => {
    if (!observedAt) {
      if (level === 'green') return 'Live source (< 24h)';
      if (level === 'yellow') return 'Observed 1-7 days ago';
      return 'Audited (> 7d)';
    }

    try {
      const date = new Date(observedAt);
      const now = new Date();
      const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffHours <= 1) return 'Observed ~1h ago';
      if (diffHours < 24) return `Observed ${diffHours}h ago`;
      const diffDays = Math.round(diffHours / 24);
      if (diffDays <= 7) return `Observed ${diffDays}d ago`;
      return `Observed ${diffDays}d ago`;
    } catch {
      return 'Observation recorded';
    }
  };

  const getBadgeConfig = () => {
    switch (level) {
      case 'green':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          icon: CheckCircle2
        };
      case 'yellow':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          icon: AlertTriangle
        };
      case 'red':
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          icon: AlertCircle
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${className}`}
      title={observedAt ? `Source observation recorded at: ${new Date(observedAt).toLocaleString()}` : undefined}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3" />
      <span>{formatObservedText()}</span>
    </span>
  );
};
