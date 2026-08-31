import { CountEntry, maxCount } from '@/lib/utils/libraryAnalytics';

export default function StatBarList({
  title,
  entries,
}: {
  title: string;
  entries: CountEntry[];
}) {
  const max = Math.max(1, maxCount(entries));
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {entries.map((e) => (
        <div key={e.key} className="flex items-center gap-2">
          <span className="w-28 shrink-0 truncate text-xs">{e.label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded bg-muted">
            <div
              className="h-full bg-brand"
              style={{ width: `${(e.count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 text-right text-xs text-muted-foreground">{e.count}</span>
        </div>
      ))}
    </div>
  );
}
