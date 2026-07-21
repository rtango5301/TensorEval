'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import {
  TestTube2,
  BarChart3,
  GitCompare,
  Package,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: TestTube2,
    title: 'Synthetic Query Generation',
    description:
      'Auto-generate test cases from domain knowledge. Cover edge cases humans would miss.',
  },
  {
    icon: BarChart3,
    title: 'Multi-Metric Evaluation',
    description: 'Task Completion, Accuracy, Latency, Plan Quality, Safety, Efficiency.',
  },
  {
    icon: GitCompare,
    title: 'A/B Testing',
    description: 'Compare agent versions head-to-head. See exactly what changed and why.',
  },
  {
    icon: Package,
    title: 'Training Data Export',
    description: 'Export passing eval traces as fine-tuning data. Close the feedback loop.',
  },
];

export function Features() {
  const [activeFeature, setActiveFeature] = useState(0);

  const goToNext = useCallback(() => {
    setActiveFeature((prev) => (prev < features.length - 1 ? prev + 1 : prev));
  }, []);

  const goToPrev = useCallback(() => {
    setActiveFeature((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  return (
    <section
      id="features"
      className="scroll-mt-20 bg-[var(--background)] px-4 py-16 lg:px-10 lg:py-20"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 lg:mb-12"
        >
          <p className="text-base uppercase tracking-[0.2em] text-[var(--primary)] font-bold mb-4">
            Features
          </p>
          <h2 className="mb-3 font-display text-2xl font-bold tracking-tight md:text-3xl lg:mb-4 lg:text-4xl">
            Beyond testing. Beyond metrics.
          </h2>
          <p className="text-base lg:text-lg text-[var(--text-secondary)]">
            Generate tests. Measure performance. Compare versions. Export insights.
          </p>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-4 gap-6 lg:grid-cols-12">
          {/* Feature Cards */}
          <div className="col-span-4 flex flex-col gap-3 lg:col-span-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setActiveFeature(index)}
                  onClick={() => setActiveFeature(index)}
                  className={`cursor-pointer rounded-[8px] border bg-white p-4 transition-colors lg:p-5 ${
                    activeFeature === index
                      ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                      : 'border-[var(--outline-variant)] hover:border-[var(--primary)]'
                  }`}
                >
                  <div className="text-2xl mb-3">
                    <Icon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <h4 className="mb-1.5 font-display font-semibold">{feature.title}</h4>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Feature Screens with Navigation Arrows */}
          <div className="relative col-span-4 min-h-[400px] lg:col-span-7 lg:min-h-[580px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {activeFeature === 0 && <QueryGeneratorFeature />}
                {activeFeature === 1 && <MetricsDashboardFeature />}
                {activeFeature === 2 && <ABTestingFeature />}
                {activeFeature === 3 && <ExportFeature />}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <motion.button
              onClick={goToPrev}
              disabled={activeFeature === 0}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute left-2 lg:-left-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                activeFeature === 0
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white/80'
                  : 'border-[var(--primary)] text-[var(--primary)] bg-white hover:bg-[var(--primary)] hover:text-white'
              }`}
              aria-label="Previous feature"
            >
              <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            </motion.button>

            <motion.button
              onClick={goToNext}
              disabled={activeFeature === features.length - 1}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute right-2 lg:-right-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                activeFeature === features.length - 1
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white/80'
                  : 'border-[var(--primary)] text-[var(--primary)] bg-white hover:bg-[var(--primary)] hover:text-white'
              }`}
              aria-label="Next feature"
            >
              <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

function WindowHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-[var(--ui-header)] border-b border-[var(--ui-border)]">
      <div className="flex gap-2">
        <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
        <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
        <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
      </div>
      <span className="flex-1 text-center text-sm text-[var(--text-secondary)] font-medium">
        {title}
      </span>
    </div>
  );
}

function QueryGeneratorFeature() {
  // Agent configurations for all 3 agent types
  const agents = [
    {
      name: 'Browser Agent',
      iconBg: '#e0f2fe',
      iconColor: '#0ea5e9',
      capabilities: ['DOM Tree Access', 'Event Listeners', 'Network Intercept'],
      icon: (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      ),
    },
    {
      name: 'Coding Agent',
      iconBg: '#fef3c7',
      iconColor: '#f59e0b',
      capabilities: ['Code Generation', 'Bug Detection', 'Refactoring'],
      icon: (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
          />
        </svg>
      ),
    },
    {
      name: 'Data Analyst Agent',
      iconBg: '#dbeafe',
      iconColor: '#3b82f6',
      capabilities: ['Data Processing', 'Statistical Analysis', 'Visualization'],
      icon: (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      ),
    },
  ];

  // Generic dataset chips that span all agent types
  const datasets = [
    {
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      label: 'APIs',
      active: false,
    },
    {
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      label: 'Files',
      active: true,
    },
    {
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
      label: 'Database',
      active: false,
    },
  ];

  // Mixed output queries - one from each agent type
  const outputQueries = [
    {
      category: 'Shopping Flow',
      categoryColor: '#f97316',
      query: 'Add item to cart and initiate checkout process',
    },
    {
      category: 'Code Review',
      categoryColor: 'var(--brand-secondary)',
      query: 'Analyze function for security vulnerabilities',
    },
    {
      category: 'Trend Analysis',
      categoryColor: '#3b82f6',
      query: 'Identify seasonal patterns in sales data',
    },
  ];

  return (
    <div className="flex h-[540px] flex-col overflow-hidden rounded-[8px] border border-gray-200 bg-white">
      <WindowHeader title="Synthetic Query Generation" />
      <div className="h-[calc(100%-44px)] flex bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] overflow-hidden px-4 py-2">
        {/* Three Column Layout */}
        <div className="flex-1 grid grid-cols-[0.85fr_1.3fr_1fr] gap-3 items-center">
          {/* Left Column - Stacked Agent Cards */}
          <div className="flex flex-col gap-2 justify-center">
            {agents.map((agent, agentIdx) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, delay: agentIdx * 0.1 }}
                className="rounded-[8px] border border-gray-100 bg-white p-2"
              >
                {/* Agent Header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: agentIdx * 0.3,
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: agent.iconBg }}
                  >
                    <span style={{ color: agent.iconColor }}>{agent.icon}</span>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate font-display text-[11px] font-bold text-gray-900">
                      {agent.name}
                    </h4>
                    <div className="flex items-center gap-1">
                      <motion.span
                        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: agentIdx * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"
                      />
                      <p className="text-[9px] text-gray-400">Active</p>
                    </div>
                  </div>
                </div>

                {/* Capabilities - compact text list */}
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 pl-1">
                  {agent.capabilities.map((cap, idx) => (
                    <motion.span
                      key={cap}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + agentIdx * 0.1 + idx * 0.05 }}
                      className="text-[9px] text-gray-500"
                    >
                      • {cap}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Center Column - Processing Engine */}
          <div className="flex flex-col items-center relative px-2">
            {/* Animated dashed lines from left cards (Browser, Coding, Data Analyst) */}
            <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-44 -ml-1 overflow-visible">
              {/* Top line - from Browser Agent */}
              <motion.path
                d="M 0 5 Q 10 5, 20 30 L 32 71"
                fill="none"
                stroke="var(--brand-highlight)"
                strokeOpacity="0.25"
                strokeWidth="2"
                strokeDasharray="5 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
              {/* Middle line - from Coding Agent */}
              <motion.path
                d="M 0 88 L 32 88"
                fill="none"
                stroke="var(--brand-highlight)"
                strokeOpacity="0.25"
                strokeWidth="2"
                strokeDasharray="5 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              />
              {/* Bottom line - from Data Analyst Agent */}
              <motion.path
                d="M 0 171 Q 10 171, 20 146 L 32 105"
                fill="none"
                stroke="var(--brand-highlight)"
                strokeOpacity="0.25"
                strokeWidth="2"
                strokeDasharray="5 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              />
              {/* Animated dot for top line */}
              <motion.circle
                r="3"
                fill="var(--brand-secondary)"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [0, 16, 32],
                  cy: [5, 18, 71],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Animated dot for middle line */}
              <motion.circle
                r="3"
                fill="var(--brand-secondary)"
                animate={{ cx: [0, 32], cy: [88, 88] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
              />
              {/* Animated dot for bottom line */}
              <motion.circle
                r="3"
                fill="var(--brand-secondary)"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [0, 16, 32],
                  cy: [171, 158, 105],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1, ease: 'easeInOut' }}
              />
            </svg>

            {/* Animated dashed lines to right cards */}
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-44 -mr-1 overflow-visible">
              {/* Top line */}
              <motion.path
                d="M 0 35 Q 15 35, 25 15 L 32 5"
                fill="none"
                stroke="var(--brand-highlight)"
                strokeOpacity="0.25"
                strokeWidth="2"
                strokeDasharray="5 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
              {/* Middle line */}
              <motion.path
                d="M 0 88 L 32 88"
                fill="none"
                stroke="var(--brand-highlight)"
                strokeOpacity="0.25"
                strokeWidth="2"
                strokeDasharray="5 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
              {/* Bottom line */}
              <motion.path
                d="M 0 141 Q 15 141, 25 161 L 32 171"
                fill="none"
                stroke="var(--brand-highlight)"
                strokeOpacity="0.25"
                strokeWidth="2"
                strokeDasharray="5 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              />
              {/* Animated dots on lines */}
              <motion.circle
                r="2.5"
                fill="var(--brand-secondary)"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [0, 16, 32],
                  cy: [35, 25, 5],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.circle
                r="2.5"
                fill="var(--brand-secondary)"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [0, 16, 32],
                  cy: [88, 88, 88],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
              <motion.circle
                r="2.5"
                fill="var(--brand-secondary)"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [0, 16, 32],
                  cy: [141, 151, 171],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              />
            </svg>

            {/* Processing Engine Badge with glow */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                opacity: { duration: 0.3 },
                y: { duration: 0.3 },
              }}
              className="z-20 mb-2 rounded-full bg-[var(--brand-secondary)] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white"
            >
              Processing Engine
            </motion.div>

            {/* Engine Card with Dashed Border */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-3 w-full"
            >
              {/* Gear Icon with rotation */}
              <div className="flex justify-center mb-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--brand-highlight)]/30 bg-[var(--surface-container-low)]"
                >
                  <svg
                    className="h-6 w-6 text-[var(--brand-secondary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Pipeline Status */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-gray-600">Synthesis Pipeline</span>
                  <span className="text-[10px] font-semibold">
                    <span className="text-[var(--brand-secondary)]">STEP</span>{' '}
                    <span className="text-gray-400">03/04</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="relative h-full rounded-full bg-[var(--brand-highlight)]"
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>
              </div>

              {/* Dataset Chips */}
              <div className="flex justify-center gap-1.5">
                {datasets.map((ds, idx) => (
                  <motion.div
                    key={ds.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-full text-[9px] font-medium border cursor-pointer transition-colors ${
                      ds.active
                        ? 'bg-[#dcfce7] border-[#86efac] text-[#15803d]'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className={ds.active ? 'text-[#22c55e]' : 'text-gray-400'}>
                      {ds.icon}
                    </span>
                    <span>{ds.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Output Queue */}
          <div className="flex flex-col gap-2">
            {outputQueries.map((item, idx) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                whileHover={{
                  scale: 1.02,
                  x: -3,
                }}
                transition={{ delay: 0.4 + idx * 0.15, type: 'spring', stiffness: 300 }}
                className="relative cursor-pointer rounded-[8px] border border-gray-100 bg-white p-2.5"
              >
                {/* Category Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.15, type: 'spring', stiffness: 500 }}
                  className="inline-block px-2 py-0.5 rounded text-[9px] font-semibold mb-1"
                  style={{
                    backgroundColor: `${item.categoryColor}15`,
                    color: item.categoryColor,
                  }}
                >
                  {item.category}
                </motion.div>
                {/* Query Text */}
                <p className="text-[10px] text-gray-600 leading-relaxed pr-5">{item.query}</p>
                {/* Animated Checkmark */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8 + idx * 0.15, type: 'spring', stiffness: 500 }}
                  className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#22c55e]"
                >
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </motion.div>
              </motion.div>
            ))}

            {/* Analyzing State with typing animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-1.5 pl-1 mt-1"
            >
              <motion.div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -3, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1 h-1 rounded-full bg-gray-400"
                  />
                ))}
              </motion.div>
              <span className="text-[10px] text-gray-400 italic">
                Generating synthetic queries...
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricsDashboardFeature() {
  return (
    <div className="flex h-[540px] flex-col overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
      <WindowHeader title="Performance Comparison" />
      <div className="p-5 flex-1 flex flex-col">
        {/* Legend */}
        <div className="flex items-center justify-end gap-5 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-sm text-[var(--text-muted)]">Baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--primary)]" />
            <span className="text-sm font-medium">Current</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-[1fr_1.5fr] gap-4 mb-5">
          {/* Left - Radar Chart */}
          <div className="flex justify-center items-center">
            <SixAxisRadar />
          </div>

          {/* Right - Metric Cards Grid */}
          <div className="grid grid-cols-3 gap-3">
            <MetricTile label="TASK COMPLETION" value="94%" />
            <MetricTile label="ACCURACY" value="92%" />
            <MetricTile label="PLAN QUALITY" value="88%" />
            <MetricTile label="TOOL USE" value="91%" />
            <MetricTile label="EFFICIENCY" value="93%" />
            <MetricTile label="SAFETY" value="54%" failed />
          </div>
        </div>

        {/* Bottom Section - Recent Evaluations */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Recent Evaluations
            </span>
            <span className="text-xs text-[var(--primary)] font-medium cursor-pointer">
              VIEW ALL →
            </span>
          </div>
          <div className="space-y-2">
            <EvalRow
              name="Support Agent v2.1 (GPT-4 Turbo)"
              score="94%"
              status="passed"
              time="2m ago"
            />
            <EvalRow
              name="Booking Agent v1.3 (Claude Sonnet)"
              score="88%"
              status="passed"
              time="14m ago"
            />
            <EvalRow
              name="Research Agent v1.0 (Llama 70B)"
              score="72%"
              status="failed"
              time="1h ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ABTestingFeature() {
  return (
    <div className="flex h-[540px] flex-col overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
      <WindowHeader title="A/B Comparison Scorecard v2.3 vs v2.4" />
      <div className="p-5 flex-1 flex flex-col">
        {/* Comparison Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Baseline v2.3 */}
          <div className="border-2 border-[var(--border-light)] rounded-xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold">v2.3</span>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                  Baseline
                </span>
              </div>
              <div className="space-y-3">
                <CompareRow label="Task Completion" value="88.5%" />
                <CompareRow label="Accuracy" value="92%" />
                <CompareRow label="Latency" value="1.5s" />
                <CompareRow label="Cost" value="$0.036" />
                <CompareRow label="Safety" value="99.1%" />
                <CompareRow label="Efficiency" value="74%" />
              </div>
            </div>
          </div>

          {/* Winner v2.4 */}
          <div className="border-2 border-[var(--accent-green)] rounded-xl overflow-hidden bg-[var(--accent-green)]/[0.02]">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold">v2.4</span>
                <span className="px-2.5 py-1 bg-[var(--accent-green)] text-white rounded-full text-xs font-semibold">
                  WINNER
                </span>
              </div>
              <div className="space-y-3">
                <CompareRow label="Task Completion" value="94.2%" change="up" winner />
                <CompareRow label="Accuracy" value="94%" change="up" winner />
                <CompareRow label="Latency" value="1.2s" change="down" winner />
                <CompareRow label="Plan Quality" value="$0.047" change="up" negative />
                <CompareRow label="Safety" value="99.8%" change="up" winner />
                <CompareRow label="Efficiency" value="86%" change="up" winner />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Divergence Chart */}
        <div className="bg-[var(--bg-subtle)] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Performance Divergence (100 Test Cases)
            </span>
            <div className="flex items-center gap-4">
              <div className="px-2 py-1 bg-gray-800 text-white text-[10px] rounded">
                Divergence point: +18.4%
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-0.5 bg-gray-400" style={{ borderStyle: 'dashed' }} /> v2.3
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-4 h-0.5 bg-[var(--primary)]" /> v2.4
                </span>
              </div>
            </div>
          </div>
          <div className="h-24 relative">
            {/* Chart visualization */}
            <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
              {/* Baseline v2.3 line (dashed) */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
                d="M 0 60 Q 100 55 200 50 T 400 55"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.5"
              />
              {/* Current v2.4 line */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
                d="M 0 65 Q 80 55 160 45 Q 240 30 300 15 T 400 10"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
              />
              {/* Divergence point */}
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, duration: 0.3 }}
                cx="300"
                cy="15"
                r="5"
                fill="var(--primary)"
              />
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, duration: 0.3 }}
                cx="300"
                cy="50"
                r="4"
                fill="var(--text-muted)"
                opacity="0.5"
              />
            </svg>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-[var(--text-muted)] uppercase">
            <span>Case 1</span>
            <span>Case 25</span>
            <span>Case 50</span>
            <span>Case 75</span>
            <span>Case 100</span>
          </div>
        </div>

        {/* Statistical Significance */}
        <div className="flex items-center justify-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--accent-green)]" />
          <span className="text-sm font-medium">
            Statistical significance: <span className="text-[var(--accent-green)]">95.2%</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ExportFeature() {
  return (
    <div className="flex h-[540px] flex-col overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
      <WindowHeader title="EXPORT TRAINING DATA" />
      <div className="p-5 flex-1 flex flex-col">
        <div className="grid grid-cols-[1.1fr_1fr] gap-4 flex-1">
          {/* Left - Configuration */}
          <div>
            {/* 1. Select Source */}
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1.5">1. Select Source</label>
              <div className="relative">
                <select className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white text-sm appearance-none cursor-pointer">
                  <option>Passed Evaluations - Q3</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  ▼
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                Available: <strong className="text-[var(--foreground)]">1,247 traces</strong> |
                Selected: <strong className="text-[var(--foreground)]">1,103</strong>
              </p>
            </div>

            {/* 2. Filter Criteria */}
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1.5">2. Filter Criteria</label>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-[11px] font-medium">
                  High Confidence <span className="cursor-pointer">×</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--accent-green)]/10 text-[var(--accent-green)] rounded-full text-[11px] font-medium">
                  No PII <span className="cursor-pointer">×</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 border border-dashed border-[var(--border)] text-[var(--text-muted)] rounded-full text-[11px] cursor-pointer">
                  + Add Filter
                </span>
              </div>
            </div>

            {/* 3. Export Format */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1.5">3. Export Format</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2.5 p-2.5 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg-subtle)]">
                  <input type="radio" name="exportFormat" className="accent-[var(--primary)]" />
                  <div className="text-sm">JSONL (OpenAI format)</div>
                </label>
                <label className="flex items-center gap-2.5 p-2.5 border-2 border-[var(--primary)] rounded-lg cursor-pointer bg-[var(--primary)]/[0.02]">
                  <input
                    type="radio"
                    name="exportFormat"
                    defaultChecked
                    className="accent-[var(--primary)]"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium">Alpaca format (Parquet)</span>
                    <span className="px-1.5 py-0.5 bg-[var(--primary)] text-white text-[8px] font-semibold rounded">
                      RECOMMENDED
                    </span>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 p-2.5 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg-subtle)]">
                  <input type="radio" name="exportFormat" className="accent-[var(--primary)]" />
                  <div className="text-sm">CSV / ShareGPT</div>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-[var(--primary)] py-2.5 text-sm font-semibold text-white">
              <span>✦</span> Generate Export
            </button>
            <p className="text-[10px] text-[var(--text-muted)] text-center mt-1.5">
              Estimated file size: ~2.4 MB
            </p>
          </div>

          {/* Right - Live Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <span className="text-[var(--primary)]">&lt;&gt;</span> LIVE PREVIEW
              </span>
              <span className="text-[11px] text-[var(--primary)] font-medium cursor-pointer">
                Copy
              </span>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-[11px] text-gray-300 h-[180px] overflow-hidden">
              <div className="text-gray-500">{'{'}</div>
              <div className="pl-3">
                <span className="text-green-400">"instruction"</span>:{' '}
                <span className="text-amber-300">"How do I track my ord..."</span>,
              </div>
              <div className="pl-3">
                <span className="text-green-400">"input"</span>:{' '}
                <span className="text-amber-300">""</span>,
              </div>
              <div className="pl-3">
                <span className="text-green-400">"output"</span>:{' '}
                <span className="text-amber-300">"I'd be happy to help..."</span>
              </div>
              <div className="text-gray-500">{'},'}</div>
              <div className="text-gray-500">{'{'}</div>
              <div className="pl-3">
                <span className="text-green-400">"instruction"</span>:{' '}
                <span className="text-amber-300">"Summarize the return..."</span>,
              </div>
              <div className="pl-3">
                <span className="text-green-400">"input"</span>:{' '}
                <span className="text-amber-300">"Returns are accepted..."</span>,
              </div>
              <div className="pl-3">
                <span className="text-green-400">"output"</span>:{' '}
                <span className="text-amber-300">"Customers have 30..."</span>
              </div>
              <div className="text-gray-500">{'}'}</div>
            </div>

            {/* Schema Validation */}
            <div className="mt-2.5 p-2.5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-light)] flex gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[var(--primary)] text-[10px]">ℹ</span>
              </div>
              <div>
                <div className="text-xs font-medium">Schema Validation</div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  All 1,103 entries validated against Alpaca format.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function SixAxisRadar() {
  const size = 200;
  const center = size / 2;
  const levels = [25, 50, 75, 100];
  const labels = [
    'Task Completion',
    'Accuracy',
    'Plan Quality',
    'Tool Use',
    'Efficiency',
    'Safety',
  ];
  const currentData = [94, 92, 88, 91, 93, 54];
  const failedIndex = 5; // Safety index
  const baselineData = [80, 85, 75, 82, 78, 90];

  const angleStep = (Math.PI * 2) / 6;
  const maxRadius = 70;

  const getPoint = (value: number, index: number) => {
    const radius = (value / 100) * maxRadius;
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const createPath = (data: number[]) => {
    return (
      data
        .map((value, index) => {
          const point = getPoint(value, index);
          return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        })
        .join(' ') + ' Z'
    );
  };

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Grid levels - hexagons */}
      {levels.map((level) => {
        const radius = (level / 100) * maxRadius;
        const points = Array.from({ length: 6 }, (_, j) => {
          const angle = angleStep * j - Math.PI / 2;
          return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
        }).join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            opacity={0.4}
          />
        );
      })}

      {/* Axis lines */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + maxRadius * Math.cos(angle)}
            y2={center + maxRadius * Math.sin(angle)}
            stroke="var(--border)"
            strokeWidth="1"
            opacity={0.4}
          />
        );
      })}

      {/* Baseline polygon */}
      <motion.path
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        d={createPath(baselineData)}
        fill="var(--text-muted)"
        fillOpacity="0.08"
        stroke="var(--text-muted)"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* Current polygon */}
      <motion.path
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        d={createPath(currentData)}
        fill="var(--primary)"
        fillOpacity="0.15"
        stroke="var(--primary)"
        strokeWidth="2"
      />

      {/* Data points for current */}
      {currentData.map((value, index) => {
        const point = getPoint(value, index);
        const isFailed = index === failedIndex;
        return (
          <motion.circle
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + index * 0.05 }}
            cx={point.x}
            cy={point.y}
            r={isFailed ? 5 : 4}
            fill={isFailed ? 'var(--error)' : 'var(--primary)'}
          />
        );
      })}

      {/* Labels */}
      {labels.map((label, index) => {
        const angle = angleStep * index - Math.PI / 2;
        const labelRadius = maxRadius + 20;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        const isFailed = index === failedIndex;
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-[9px] ${isFailed ? 'fill-[var(--error)] font-semibold' : 'fill-[var(--text-muted)]'}`}
          >
            {label}
          </text>
        );
      })}

      {/* Center 100 label */}
      <text
        x={center + 5}
        y={center - maxRadius + 10}
        className="text-[8px] fill-[var(--text-muted)]"
      >
        100
      </text>
    </svg>
  );
}

function MetricTile({ label, value, failed }: { label: string; value: string; failed?: boolean }) {
  return (
    <div
      className={`rounded-xl p-4 text-center ${
        failed
          ? 'bg-[var(--error)]/10 border-2 border-[var(--error)]'
          : 'bg-[var(--bg-subtle)] border border-[var(--border-light)]'
      }`}
    >
      <div
        className={`text-[10px] uppercase tracking-wide mb-2 ${
          failed ? 'text-[var(--error)] font-semibold' : 'text-[var(--text-muted)]'
        }`}
      >
        {label}
      </div>
      <div className={`text-2xl font-bold ${failed ? 'text-[var(--error)]' : ''}`}>{value}</div>
    </div>
  );
}

function EvalRow({
  name,
  score,
  status,
  time,
}: {
  name: string;
  score: string;
  status: 'passed' | 'failed';
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-light)]">
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
          status === 'passed'
            ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
            : 'bg-[var(--error)]/10 text-[var(--error)]'
        }`}
      >
        {status === 'passed' ? 'PASS' : 'FAIL'}
      </span>
      <span className="flex-1 text-sm font-medium truncate">{name}</span>
      <span
        className={`text-sm font-semibold ${
          parseInt(score) >= 80 ? 'text-[var(--accent-green)]' : 'text-[var(--error)]'
        }`}
      >
        {score}
      </span>
      <span className="text-xs text-[var(--text-muted)]">{time}</span>
    </div>
  );
}

function CompareRow({
  label,
  value,
  change,
  winner,
  negative,
}: {
  label: string;
  value: string;
  change?: 'up' | 'down';
  winner?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <div className="flex items-center gap-1">
        <span
          className={`text-sm font-semibold ${winner ? 'text-[var(--accent-green)]' : negative ? 'text-[var(--error)]' : ''}`}
        >
          {value}
        </span>
        {change && (
          <span
            className={`text-xs ${negative ? 'text-[var(--error)]' : 'text-[var(--accent-green)]'}`}
          >
            {change === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  );
}
