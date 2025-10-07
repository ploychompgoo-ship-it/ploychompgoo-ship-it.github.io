import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import ContentGrid from '@/components/ContentGrid';
import { useStore } from './store.js';
import aiService from './services/ai-service.js';

function App() {
  const { contentItems, addContentItem, updateContentStatus, deleteContentItem } = useStore();

  useEffect(() => {
    // Set up Socket.IO listener for new content from LINE
    aiService.subscribeToContent((newContent) => {
      console.log('[Dashboard] newContent received:', newContent);
      addContentItem(newContent);
    });

    // Cleanup on unmount
    return () => {
      aiService.cleanup();
    };
  }, [addContentItem]);

  // Calculate stats from contentItems
  const stats = {
    total: contentItems.length,
    pending: contentItems.filter(item => item.status === 'Pending').length,
    approved: contentItems.filter(item => item.status === 'Approved').length,
    rejected: contentItems.filter(item => item.status === 'Rejected').length,
  };

  const handleApprove = (id) => {
    updateContentStatus(id, 'Approved');
  };

  const handleReject = (id) => {
    updateContentStatus(id, 'Rejected');
  };

  const handleDelete = (id) => {
    deleteContentItem(id);
  };

  return (
    <>
      <Helmet>
        <title>Line OA Dashboard - AI Content Management</title>
        <meta name="description" content="Dashboard สำหรับจัดการเนื้อหาจาก Line OA พร้อม AI Agent ที่ช่วยปรับปรุงข้อความและรูปภาพอัตโนมัติ" />
      </Helmet>

      <div className="min-h-screen pb-20">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <StatsCards stats={stats} />
          <ContentGrid 
            contents={contentItems}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
          />
        </main>

        <Toaster />
      </div>
    </>
  );
}

export default App;