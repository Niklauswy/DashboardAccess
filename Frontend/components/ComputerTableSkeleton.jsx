import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ComputerTableSkeleton() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full mx-auto space-y-6">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="w-full shadow-lg border-0 bg-white/50 backdrop-blur p-4">
            <CardHeader className="border-b border-slate-100 bg-white pb-3">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-24" />
                  </CardTitle>
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-10" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
              <div className="mt-4">
                <div className="flex h-2 gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="flex-1 h-2 rounded" />
                  ))}
                </div>
                <div className="flex justify-between text-xs mt-1 text-slate-500">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
