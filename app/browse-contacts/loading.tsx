import { Skeleton } from "@/components/ui/skeleton"

export default function BrowseContactsLoading() {
  return (
    <div className="min-h-screen bg-white antialiased font-sans">
      <div className="max-w-md mx-auto">
        {/* Header Skeleton */}
        <header className="fixed top-0 left-0 right-0 bg-white px-4 py-3 flex items-center justify-between z-40 max-w-md mx-auto h-16">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="w-32 h-4" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="w-5 h-5" />
          </div>
        </header>

        {/* Content Skeleton */}
        <div className="pt-16 pb-32 px-4">
          {/* Search Skeleton */}
          <div className="mb-4">
            <Skeleton className="w-full h-12 rounded-full" />
          </div>

          {/* Filters Skeleton */}
          <div className="mb-6 space-y-3">
            <div>
              <Skeleton className="w-12 h-3 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="w-16 h-6 rounded-full" />
                <Skeleton className="w-20 h-6 rounded-full" />
                <Skeleton className="w-18 h-6 rounded-full" />
              </div>
            </div>
            <div>
              <Skeleton className="w-16 h-3 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="w-20 h-6 rounded-full" />
                <Skeleton className="w-16 h-6 rounded-full" />
                <Skeleton className="w-18 h-6 rounded-full" />
              </div>
            </div>
          </div>

          {/* Contacts List Skeleton */}
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="w-32 h-4 mb-1" />
                    <Skeleton className="w-24 h-3 mb-2" />
                    <Skeleton className="w-48 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
