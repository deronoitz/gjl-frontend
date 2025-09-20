import { Metadata } from 'next';
import RefreshButton from '@/components/RefreshButton';

export const metadata: Metadata = {
  title: 'Offline - Griya Jannatin',
  description: 'Aplikasi sedang offline',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
      <div className="text-center px-4">
        <div className="mx-auto w-24 h-24 mb-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
          <svg 
            className="w-12 h-12 text-gray-400 dark:text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8.111 16.404a5.5 5.5 0 717.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" 
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Sedang Offline
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tidak dapat terhubung ke internet. Beberapa fitur mungkin tidak tersedia.
        </p>
        <RefreshButton />
      </div>
    </div>
  );
}
