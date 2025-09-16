'use client';

import dynamic from 'next/dynamic';

const AdminMapEditor = dynamic(() => import('./AdminMapEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map editor...</div>
    </div>
  )
});

export default AdminMapEditor;
