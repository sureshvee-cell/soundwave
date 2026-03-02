'use client';

import { useState } from 'react';
import { Settings, Lock, Volume2, Bell, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type AudioQuality = 'standard' | 'high' | 'veryHigh';

export default function SettingsPage() {
  const [autoplay, setAutoplay] = useState(true);
  const [crossfade, setCrossfade] = useState(30);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('high');
  const [notifications, setNotifications] = useState(true);

  const sectionVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
      },
    }),
  };

  const qualityOptions: { value: AudioQuality; label: string; description: string }[] = [
    { value: 'standard', label: 'Standard', description: '96 kbps' },
    { value: 'high', label: 'High', description: '256 kbps' },
    { value: 'veryHigh', label: 'Very High', description: '320 kbps' },
  ];

  return (
    <div className="min-h-screen bg-surface-base">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-surface-base/80 backdrop-blur-md border-b border-surface-border"
      >
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-brand-400" />
            <h1 className="text-4xl font-bold text-content-primary">Settings</h1>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        {/* Account Section */}
        <motion.section
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="surface-raised bg-surface-raised rounded-lg p-8 border border-surface-border">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-brand-400" />
              <h2 className="text-xl font-bold text-content-primary">Account</h2>
            </div>

            <div className="space-y-6">
              {/* Email Display */}
              <div className="flex items-center justify-between pb-6 border-b border-surface-border">
                <div>
                  <p className="text-sm text-content-secondary mb-1">Email Address</p>
                  <p className="text-content-primary font-medium">
                    user@soundwave.app
                  </p>
                </div>
              </div>

              {/* Change Password Button */}
              <button className="w-full px-4 py-3 flex items-center gap-2 rounded-lg bg-surface-hover hover:bg-surface-border transition-colors text-content-primary font-medium">
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>
        </motion.section>

        {/* Playback Section */}
        <motion.section
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="surface-raised bg-surface-raised rounded-lg p-8 border border-surface-border">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-brand-400" />
              <h2 className="text-xl font-bold text-content-primary">Playback</h2>
            </div>

            <div className="space-y-8">
              {/* Autoplay Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-content-primary font-medium mb-1">Autoplay</p>
                  <p className="text-sm text-content-secondary">
                    Automatically play similar songs when queue ends
                  </p>
                </div>
                <button
                  onClick={() => setAutoplay(!autoplay)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors flex items-center',
                    autoplay ? 'bg-brand-600' : 'bg-surface-hover'
                  )}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full"
                    animate={{ x: autoplay ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Crossfade Slider */}
              <div className="pt-4 border-t border-surface-border">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-content-primary font-medium">Crossfade</p>
                  <span className="text-sm text-brand-400 font-medium">
                    {crossfade}s
                  </span>
                </div>
                <p className="text-sm text-content-secondary mb-4">
                  Smoothly fade between tracks
                </p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={crossfade}
                  onChange={(e) => setCrossfade(Number(e.target.value))}
                  className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-brand-400"
                />
                <div className="flex justify-between text-xs text-content-muted mt-2">
                  <span>0s</span>
                  <span>100s</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Audio Quality Section */}
        <motion.section
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="surface-raised bg-surface-raised rounded-lg p-8 border border-surface-border">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-brand-400" />
              <h2 className="text-xl font-bold text-content-primary">Audio Quality</h2>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-content-secondary mb-4">
                Higher quality uses more data
              </p>
              {qualityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAudioQuality(option.value)}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border transition-all text-left flex items-center justify-between',
                    audioQuality === option.value
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'bg-surface-base border-surface-border text-content-primary hover:border-surface-border hover:bg-surface-hover'
                  )}
                >
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className={cn(
                      'text-sm',
                      audioQuality === option.value
                        ? 'text-white/70'
                        : 'text-content-secondary'
                    )}>
                      {option.description}
                    </p>
                  </div>
                  {audioQuality === option.value && (
                    <div className="w-5 h-5 rounded-full bg-white/30" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Notifications Section */}
        <motion.section
          custom={3}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="surface-raised bg-surface-raised rounded-lg p-8 border border-surface-border">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-brand-400" />
              <h2 className="text-xl font-bold text-content-primary">Notifications</h2>
            </div>

            <div className="space-y-6">
              {/* Notifications Toggle */}
              <div className="flex items-center justify-between pb-6 border-b border-surface-border">
                <div>
                  <p className="text-content-primary font-medium mb-1">
                    Push Notifications
                  </p>
                  <p className="text-sm text-content-secondary">
                    Get notified about new releases and updates
                  </p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors flex items-center',
                    notifications ? 'bg-brand-600' : 'bg-surface-hover'
                  )}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full"
                    animate={{ x: notifications ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Notification Types */}
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded accent-brand-400 cursor-pointer"
                  />
                  <span className="text-content-primary">New releases from followed artists</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded accent-brand-400 cursor-pointer"
                  />
                  <span className="text-content-primary">Playlist updates and recommendations</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-brand-400 cursor-pointer"
                  />
                  <span className="text-content-primary">Account and security alerts</span>
                </label>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
