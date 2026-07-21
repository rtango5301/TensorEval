'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

export function Demo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <section id="demo" className="scroll-mt-20 bg-[var(--background)] px-4 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="col-span-4 mb-8 text-center lg:col-span-12 lg:mb-12"
        >
          <p className="text-base uppercase tracking-[0.2em] text-[var(--primary)] font-bold mb-4">
            Demo
          </p>
          <h2 className="mb-3 font-display text-2xl font-bold tracking-tight md:text-3xl lg:mb-4 lg:text-4xl">
            See it in action
          </h2>
          <p className="text-base lg:text-lg text-[var(--text-secondary)] max-w-[600px] mx-auto">
            Watch how TensorEval evaluates your agent in under 20 seconds
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="col-span-4 mx-auto w-full max-w-[900px] lg:col-span-10 lg:col-start-2"
        >
          <div className="group relative cursor-pointer overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-[#2d2d2d]">
            <video
              ref={videoRef}
              src="/demo/demo.mp4"
              playsInline
              onEnded={handleVideoEnd}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              className="w-full aspect-video block"
            />
            {/* Play/Pause Overlay */}
            <button
              onClick={togglePlay}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isPlaying ? 'opacity-0 hover:opacity-100 bg-black/10' : 'opacity-100 bg-black/30'
              }`}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-[var(--primary)] rounded-full shadow-lg shadow-[var(--primary)]/30"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="white" />
                ) : (
                  <Play className="w-6 h-6 lg:w-8 lg:h-8 text-white ml-1" fill="white" />
                )}
              </motion.div>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
