
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AIProcessingModal = ({ isOpen, content }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="glass-effect border border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI กำลังประมวลผล
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            กรุณารอสักครู่ ระบบ AI กำลังปรับปรุงเนื้อหาของคุณ
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 space-y-6">
          <div className="flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-1"
            >
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-400" />
              </div>
            </motion.div>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 text-sm text-gray-300"
              >
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>กำลังวิเคราะห์เนื้อหา...</span>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 text-sm text-gray-300"
            >
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span>กำลังสร้าง Story...</span>
            </motion.div>

            {content?.type === 'image' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-3 text-sm text-gray-300"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>กำลังปรับปรุงรูปภาพ...</span>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIProcessingModal;
  