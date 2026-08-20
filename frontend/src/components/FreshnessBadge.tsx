import React from 'react';
import { FreshnessLevel } from '../types';
import { Clock, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface Props {
  level: FreshnessLevel;
  observedAt?: string;
  className?: string;
}

export const FreshnessBadge: React.FC<Props> = ({ level, observedAt, className = '' }) => {
  const formatObservedText = () => {
    if (!observedAt) {
      if (level === 'green') return 'Last observed < 24h ago';
      if (level === 'yellow') return 'Observed 1-7 days ago';
      return 'Stale (> 7 days ago)';
    }

    try {
      const date = new Date(observedAt);
      const now = new Date();
      const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffHours <= 1) return 'Last observed ~1 hour ago';
      if (diffHours < 24) return `Last observed ${diffHours}h ago`;
      const diffDays = Math.round(diffHours / 24);
      if (diffDays <= 7) return `Last observed ${diffDays}d ago`;
      return `Last observed ${diffDays}d ago`;
    } catch {
      return 'Observation recorded';
    }
  };

  const getBadgeConfig = () => {
    switch (level) {
      case 'green':
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
          dot: 'bg-emerald-400',
          icon: CheckCircle2
        };
      case 'yellow':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
          dot: 'bg-amber-400',
          icon: AlertTriangle
        };
      case 'red':
      default:
        return {
          bg: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
          dot: 'bg-rose-400',
          icon: AlertCircle
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${config.bg} ${className}`}
      title={observedAt ? `Source observation recorded at: ${new Date(observedAt).toLocaleString()}` : undefined}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3" />
      <span>{formatObservedText()}</span>
    </span>
  );
};
