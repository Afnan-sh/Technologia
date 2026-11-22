import { Skeleton } from '@/components/ui/skeleton';

export default function ListingDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Skeleton className="aspect-[16/10] w-full rounded-3xl" />
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-2xs">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-2xs">
            <Skeleton className="h-7 w-3/4 rounded-lg" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
