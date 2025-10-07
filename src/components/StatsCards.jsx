
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'ทั้งหมด',
      value: stats.total,
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/50'
    },
    {
      title: 'รอดำเนินการ',
      value: stats.pending,
      icon: Clock,
      gradient: 'from-yellow-500 to-orange-500',
      shadow: 'shadow-yellow-500/50'
    },
    {
      title: 'อนุมัติแล้ว',
      value: stats.approved,
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-500',
      shadow: 'shadow-green-500/50'
    },
    {
      title: 'ปฏิเสธ',
      value: stats.rejected,
      icon: XCircle,
      gradient: 'from-red-500 to-pink-500',
      shadow: 'shadow-red-500/50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className={`glass-effect rounded-2xl p-6 shadow-xl ${card.shadow}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
              className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
            >
              {card.value}
            </motion.div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">{card.title}</h3>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
  