
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trash2, Image as ImageIcon, MessageSquare, Calendar, User } from 'lucide-react';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

const ContentCard = ({ content, onApprove, onReject, onDelete }) => {
  const [imageError, setImageError] = useState(false);

  const statusColors = {
    pending: 'from-yellow-500 to-orange-500',
    approved: 'from-green-500 to-emerald-500',
    rejected: 'from-red-500 to-pink-500'
  };

  const statusLabels = {
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="glass-effect rounded-2xl overflow-hidden shadow-xl"
    >
      <div className={`h-2 bg-gradient-to-r ${statusColors[content.status]}`} />
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {content.type === 'image' ? (
              <ImageIcon className="w-5 h-5 text-purple-400" />
            ) : (
              <MessageSquare className="w-5 h-5 text-blue-400" />
            )}
            <span className="text-sm font-medium text-gray-300">
              {content.type === 'image' ? 'รูปภาพ' : 'ข้อความ'}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${statusColors[content.status]} text-white`}>
            {statusLabels[content.status]}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{content.userId}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(content.timestamp).toLocaleString('th-TH')}</span>
          </div>
        </div>

        {content.originalImage && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-purple-300">รูปภาพต้นฉบับ</h4>
            <div className="relative rounded-xl overflow-hidden bg-black/20">
              {!imageError ? (
                <img
                  src={content.originalImage}
                  alt="Original content"
                  className="w-full h-48 object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-600" />
                </div>
              )}
            </div>
          </div>
        )}

        {content.originalText && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-300">ข้อความต้นฉบับ</h4>
            <p className="text-sm text-gray-300 bg-black/20 rounded-lg p-3">
              {content.originalText}
            </p>
          </div>
        )}

        {content.processedText && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-300 flex items-center gap-2">
              ✨ Story ที่ปรับปรุงโดย AI
            </h4>
            <p className="text-sm text-gray-200 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
              {content.processedText}
            </p>
          </div>
        )}

        {content.status === 'pending' && (
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => onApprove(content.id)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/50"
            >
              <Check className="w-4 h-4 mr-2" />
              อนุมัติ
            </Button>
            <Button
              onClick={() => onReject(content.id)}
              variant="outline"
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <X className="w-4 h-4 mr-2" />
              ปฏิเสธ
            </Button>
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              ลบ
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-effect border border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">ยืนยันการลบ</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                คุณแน่ใจหรือไม่ที่จะลบเนื้อหานี้? การกระทำนี้ไม่สามารถย้อนกลับได้
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                ยกเลิก
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(content.id)}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              >
                ลบ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};

export default ContentCard;
  