'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StarRating({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Rate ${star} out of ${max}`}
          onClick={() => onChange(star === value ? 0 : star)}
          className="p-0.5 text-muted-foreground transition-colors hover:text-brand"
        >
          <Star
            className={cn('h-5 w-5', star <= value && 'fill-brand text-brand')}
          />
        </button>
      ))}
    </div>
  );
}
