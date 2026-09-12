'use client';

import dynamic from 'next/dynamic';

const AdminHeritageEditor = dynamic(() => import('./AdminHeritageEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-72 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
      Loading heritage editor...
    </div>
  ),
});

export default AdminHeritageEditor;
