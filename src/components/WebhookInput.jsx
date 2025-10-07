import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';
import { Sparkles, Link } from 'lucide-react';

const WebhookInput = ({ onProcess }) => {
  const [payload, setPayload] = useState('');
  const { toast } = useToast();

  const handleProcess = () => {
    if (!payload.trim()) {
      toast({
        title: '⚠️ ข้อมูลว่างเปล่า',
        description: 'กรุณาวางข้อมูล JSON จาก Webhook',
        variant: 'destructive',
      });
      return;
    }

    try {
      const parsedPayload = JSON.parse(payload);
      
      // Line webhook payload structure often contains an 'events' array
      const eventData = parsedPayload.events && parsedPayload.events[0];
      if (!eventData) {
        throw new Error("Invalid LINE webhook format. 'events' array or its first element not found.");
      }

      const message = eventData.message;
      const userId = eventData.source.userId; // Assuming userId is in eventData.source.userId

      let dataToProcess = {
        userId: userId,
        text: null,
        image: null,
      };

      if (message) {
        if (message.type === 'text') {
          dataToProcess.text = message.text;
        } else if (message.type === 'image') {
          // For image messages, Line webhook typically provides contentId
          // We'll use a placeholder image URL for now as we can't fetch content directly from frontend
          dataToProcess.image = 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&q=80'; 
        }
      }

      if (!dataToProcess.text && !dataToProcess.image) {
        throw new Error("No text or image message found in the LINE webhook event.");
      }

      onProcess(dataToProcess);
      setPayload('');
    } catch (error) {
      console.error('Error parsing webhook payload:', error);
      toast({
        title: '❌ รูปแบบข้อมูลไม่ถูกต้อง',
        description: `กรุณาตรวจสอบว่าข้อมูลที่วางเป็น JSON ที่ถูกต้องจาก Line Webhook. ข้อผิดพลาด: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-6 space-y-4 gradient-border"
    >
      <div className="flex items-center gap-3">
        <Link className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white">ประมวลผลข้อมูลจาก Webhook</h2>
      </div>
      <p className="text-sm text-gray-400">
        คัดลอกข้อมูล JSON จาก <a href="https://webhook.site/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">webhook.site</a> แล้ววางลงในช่องด้านล่างเพื่อให้ AI ประมวลผล
      </p>
      <Textarea
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        placeholder='วางข้อมูล JSON จาก Line Webhook ที่นี่ (เช่น {"events": [{"type": "message", "message": {"type": "text", "text": "สวัสดีครับ"}, "source": {"userId": "U123..."}}]})...'
        className="bg-slate-800/50 border-purple-500/30 text-gray-300 min-h-[120px] focus:border-purple-400"
      />
      <Button
        onClick={handleProcess}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        ประมวลผลด้วย AI
      </Button>
    </motion.div>
  );
};

export default WebhookInput;