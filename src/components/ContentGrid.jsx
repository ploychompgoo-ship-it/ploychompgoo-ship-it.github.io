
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ContentCard from './ContentCard';

const ContentGrid = ({ contents, onApprove, onReject, onDelete }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredContents = contents.filter(content => {
    if (activeTab === 'all') return true;
    return content.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-effect border border-white/10 p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
            ทั้งหมด
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500">
            รอดำเนินการ
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500">
            อนุมัติแล้ว
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500">
            ปฏิเสธ
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredContents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect rounded-2xl p-12 text-center"
            >
              <p className="text-gray-400 text-lg">ไม่มีเนื้อหาในหมวดนี้</p>
              <p className="text-gray-500 text-sm mt-2">ลองกดปุ่ม "จำลอง Webhook" เพื่อเพิ่มเนื้อหาทดสอบ</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredContents.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentGrid;
  