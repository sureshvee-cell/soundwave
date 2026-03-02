'use client';

import { Radio, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { mockGenres } from '@/lib/mock-data';

export default function RadioPage() {
  const handleStartRadio = (genreName: string) => {
    toast.success(`Started ${genreName} Radio`);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-surface-base">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-surface-base/80 backdrop-blur-md border-b border-surface-border"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <Radio className="w-8 h-8 text-brand-400" />
            <h1 className="text-4xl font-bold text-content-primary">Radio</h1>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-6 py-12"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {mockGenres.map((genre) => (
            <motion.div key={genre.id} variants={itemVariants}>
              <div
                className="surface-raised bg-surface-raised rounded-lg p-8 h-full flex flex-col justify-between hover:bg-surface-hover transition-colors overflow-hidden group relative"
              >
                {/* Gradient accent based on genre color */}
                <div
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{
                    background: `radial-gradient(circle at top-right, ${genre.color}, transparent)`,
                  }}
                />

                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-full mb-4"
                    style={{ backgroundColor: genre.color }}
                  />
                  <h3 className="text-2xl font-bold text-content-primary mb-2">
                    {genre.name}
                  </h3>
                  <p className="text-sm text-content-secondary">
                    Discover {genre.name.toLowerCase()} radio stations
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStartRadio(genre.name)}
                  className="relative z-10 mt-6 w-full px-4 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 group/button"
                >
                  <Play className="w-4 h-4 fill-current group-hover/button:translate-x-0.5 transition-transform" />
                  Start Radio
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
