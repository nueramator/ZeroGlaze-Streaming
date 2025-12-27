'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1F2937',
          color: '#F9FAFB',
          border: '1px solid #374151',
          borderRadius: '0.75rem',
          fontSize: '14px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#F9FAFB',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#F9FAFB',
          },
        },
        loading: {
          iconTheme: {
            primary: '#8B5CF6',
            secondary: '#F9FAFB',
          },
        },
      }}
    />
  );
}
