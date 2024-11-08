import { Skeleton } from "./ui/skeleton"
 
export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[325px] w-[500px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-[500px]" />
        <Skeleton className="h-6 w-[400px]" />
      </div>
    </div>
  )
}