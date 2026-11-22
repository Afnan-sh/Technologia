import { Skeleton } from '@/components/ui/skeleton';

export default function RequestDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 space-y-6 shadow-2xs">
        <Skeleton className="h-8 w-3/4 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
