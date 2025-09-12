import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen font-sans flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center justify-between h-16 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </header>

      <div className="flex-grow overflow-y-auto pb-36">
        <div className="p-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>

        <div className="grid w-full grid-cols-4 rounded-none bg-transparent px-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="mt-4 px-4 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-40">
        <div className="max-w-md mx-auto p-4">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
