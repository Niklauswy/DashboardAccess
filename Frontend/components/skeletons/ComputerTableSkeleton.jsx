import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ComputerTableSkeleton() {
  return (
    <div className="p-4 md:p-8 flex flex-col min-h-screen">
      <div className="w-full mx-auto space-y-6">
        {/* Stats Overview Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="bg-white shadow-sm border border-slate-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-100">
          <Skeleton className="h-9 w-full md:w-80" />
          <div className="flex gap-2 w-full md:w-auto">
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-8 w-20" />
            ))}
          </div>
        </div>

        {/* Classroom Cards Skeleton */}
        {[1, 2, 3].map((classroom) => (
          <Card key={classroom} className="overflow-hidden shadow-md border-0 bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="border-b border-slate-100 bg-white pb-3">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-medium flex items-center text-slate-800">
                    <Skeleton className="h-5 w-5 mr-2 rounded" />
                    <Skeleton className="h-6 w-36" />
                  </CardTitle>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-20 mr-2" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full ml-2" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-2 w-36 rounded-full" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
                {Array(8).fill(0).map((_, i) => (
                  <Skeleton key={i} className="p-3 rounded-md h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
