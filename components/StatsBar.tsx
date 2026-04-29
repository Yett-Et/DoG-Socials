'use client';

type Props = {
  total: number;
  posted: number;
  missed: number;
};

export default function StatsBar({ total, posted, missed }: Props) {
  const remaining = total - posted - missed;
  const pct = total > 0 ? Math.round((posted / total) * 100) : 0;

  return (
    <div className="mb-4">
      <div className="flex gap-3 mb-2">
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-gray-900">{posted}</div>
          <div className="text-xs text-gray-400 mt-0.5">Posted</div>
        </div>
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-gray-900">{remaining}</div>
          <div className="text-xs text-gray-400 mt-0.5">Remaining</div>
        </div>
        {missed > 0 && (
          <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div className="text-2xl font-bold text-amber-600">{missed}</div>
            <div className="text-xs text-amber-400 mt-0.5">Never Posted</div>
          </div>
        )}
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-gray-900">{pct}%</div>
          <div className="text-xs text-gray-400 mt-0.5">Complete</div>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
