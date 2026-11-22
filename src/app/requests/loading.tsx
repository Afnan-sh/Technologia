import { Skeleton } from '@/components/ui/skeleton';

export default function RequestsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <Skeleton className="h-11 w-full rounded-xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 h-48 space-y-4 shadow-2xs">
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
