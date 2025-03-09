"use client";
import React, { useState } from 'react';
import { 
  Toast, 
  ToastProvider, 
  ToastTitle, 
  ToastDescription, 
  ToastViewport 
} from '@/components/ui/toast';
import { CheckCircle, XCircle, Info } from "lucide-react";

export default function ToastTest() {
  const [showToast, setShowToast] = useState(false);
  const [toastProps, setToastProps] = useState({ variant: "default", toastClass: "" });
  
  const triggerToast = (variant, toastClass = "") => {
    setToastProps({ variant, toastClass });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Selecciona el icono según la variante
  const getIcon = () => {
    switch (toastProps.variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-white" />;
      case "destructive":
        return <XCircle className="h-5 w-5 text-white" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-8 space-y-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <button 
          onClick={() => triggerToast("default")}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 transition-colors rounded-md">
          Default Toast
        </button>
        <button 
          onClick={() => triggerToast("destructive")}
          className="px-4 py-2 bg-red-200 hover:bg-red-300 transition-colors rounded-md">
          Error Toast
        </button>
        {/* Distintas tonalidades para Success */}
        <button 
          onClick={() => triggerToast("success", "border border-green-700 bg-green-700 text-white dark:border-green-800 dark:bg-green-800")}
          className="px-4 py-2 bg-green-200 hover:bg-green-300 transition-colors rounded-md">
          Success Tone 1
        </button>
        <button 
          onClick={() => triggerToast("success", "border border-green-500 bg-green-500 text-white dark:border-green-600 dark:bg-green-600")}
          className="px-4 py-2 bg-green-200 hover:bg-green-300 transition-colors rounded-md">
          Success Tone 2
        </button>
        <button 
          onClick={() => triggerToast("success", "border border-green-600 bg-green-600 text-white dark:border-green-700 dark:bg-green-700")}
          className="px-4 py-2 bg-green-200 hover:bg-green-300 transition-colors rounded-md">
          Success Tone 3
        </button>
        <button 
          onClick={() => triggerToast("success", "border border-green-800 bg-green-800 text-white dark:border-green-900 dark:bg-green-900")}
          className="px-4 py-2 bg-green-200 hover:bg-green-300 transition-colors rounded-md">
          Success Tone 4
        </button>
      </div>

      <ToastProvider>
        {showToast && (
          <Toast variant={toastProps.variant} className={`flex items-center gap-3 ${toastProps.toastClass}`}>
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <ToastTitle className="text-sm font-medium mb-1">
                {toastProps.variant.charAt(0).toUpperCase() + toastProps.variant.slice(1)} Toast
              </ToastTitle>
              <ToastDescription className="text-xs opacity-90">
                This is a {toastProps.variant} notification message!
              </ToastDescription>
            </div>
          </Toast>
        )}
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}