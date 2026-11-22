import { Skeleton } from '@/components/ui/skeleton';

export default function ListingsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      <Skeleton className="h-11 w-full rounded-xl" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 h-40 flex gap-4">
            <Skeleton className="w-36 h-full rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-3 py-1">
              <Skeleton className="h-5 w-2/3 rounded-lg" />
              <Skeleton className="h-3 w-1/3 rounded-lg" />
              <Skeleton className="h-6 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
