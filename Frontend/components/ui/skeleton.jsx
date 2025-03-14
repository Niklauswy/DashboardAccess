import React from 'react';
import {cn} from "@/components/lib/utils";

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn("animate-pulse bg-gray-200 rounded", className)}
            {...props}
        />
    );
}