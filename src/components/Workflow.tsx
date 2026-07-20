'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

const workflowSteps = [
  {
    number: '01',
    title: 'Configure Agent',
    description: 'Add agent URL, MCP endpoints, and description',
  },
  {
    number: '02',
    title: 'Generate Queries',
    description: 'AI creates synthetic test cases from your domain',
  },
  {
    number: '03',
    title: 'Run Evaluation',
    description: 'TensorEval scrapes and tests your agent',
  },
  {
    number: '04',
    title: 'View Metrics',
    description: 'Accuracy, Latency, Plan Quality, Safety, Efficiency',
  },
  {
    number: '05',
    title: 'A/B Comparison',
    description: 'Compare with previous version side-by-side',
  },
  {
    number: '06',
    title: 'Ship with Confidence',
    description: 'All checks passed, ready to deploy',
  },
];

export function Workflow() {
  const [activeStep, setActiveStep] = useState(0);

  const goToNext = useCallback(() => {
    setActiveStep((prev) => (prev < workflowSteps.length - 1 ? prev + 1 : prev));
  }, []);

  const goToPrev = useCallback(() => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
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
      id="workflow"
      className="scroll-mt-20 bg-[var(--surface-container-low)] px-4 py-16 lg:px-10 lg:py-20"
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
            Workflow
          </p>
          <h2 className="mb-3 font-display text-2xl font-bold tracking-tight md:text-3xl lg:mb-4 lg:text-4xl">
            Evaluate, compare, deploy
          </h2>
          <p className="text-base lg:text-lg text-[var(--text-secondary)]">
            See how TensorEval automates your agent testing workflow
          </p>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-4 gap-6 lg:grid-cols-12">
          {/* Steps List */}
          <div className="col-span-4 flex flex-col gap-2 lg:col-span-4">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setActiveStep(index)}
                onClick={() => setActiveStep(index)}
                className={`flex cursor-pointer items-start gap-3 rounded-[8px] border p-3 transition-colors lg:gap-4 lg:p-4 ${
                  activeStep === index
                    ? 'border-[var(--primary)] bg-white'
                    : 'border-transparent hover:border-[var(--outline-variant)] hover:bg-white'
                }`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[4px] text-sm font-bold transition-colors ${
                    activeStep === index
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                  }`}
                >
                  {step.number}
                </div>
                <div>
                  <h4 className="mb-1 font-display text-[0.95rem] font-semibold">{step.title}</h4>
                  <p className="text-sm text-[var(--text-secondary)]">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Screen Display with Navigation Arrows */}
          <div className="relative col-span-4 lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="h-[400px] overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white lg:h-[500px]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {activeStep === 0 && <ConfigureScreen />}
                  {activeStep === 1 && <QueryGeneratorScreen />}
                  {activeStep === 2 && <RunningScreen />}
                  {activeStep === 3 && <MetricsScreen />}
                  {activeStep === 4 && <ABComparisonScreen />}
                  {activeStep === 5 && <ShipScreen />}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Navigation Arrows */}
            <motion.button
              onClick={goToPrev}
              disabled={activeStep === 0}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute left-2 lg:-left-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                activeStep === 0
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white/80'
                  : 'border-[var(--primary)] text-[var(--primary)] bg-white hover:bg-[var(--primary)] hover:text-white'
              }`}
              aria-label="Previous step"
            >
              <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            </motion.button>

            <motion.button
              onClick={goToNext}
              disabled={activeStep === workflowSteps.length - 1}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute right-2 lg:-right-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                activeStep === workflowSteps.length - 1
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white/80'
                  : 'border-[var(--primary)] text-[var(--primary)] bg-white hover:bg-[var(--primary)] hover:text-white'
              }`}
              aria-label="Next step"
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

function ConfigureScreen() {
  return (
    <>
      <WindowHeader title="Configure New Agent" />
      <div className="p-4 h-[calc(100%-44px)] flex flex-col">
        <div className="flex-1 grid grid-cols-[1.1fr_0.9fr] gap-3 min-h-0">
          {/* Left - Form Fields */}
          <div className="space-y-4 overflow-auto">
            <FormField label="Agent Name" value="Support Bot v2.4" />
            <FormField label="Agent URL" value="https://api.acme.com/agent/support" />
            {/* Custom MCP Server Section */}
            <div>
              <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Custom MCP Server{' '}
                <span className="font-normal text-[var(--text-muted)]">(optional)</span>
              </label>
              <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-md p-2 space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <span className="text-[8px] text-[var(--text-muted)] uppercase">Name</span>
                    <div className="text-[10px] text-[var(--text-secondary)] truncate">
                      Pricing API
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[8px] text-[var(--text-muted)] uppercase">URL</span>
                    <div className="text-[10px] text-[var(--text-secondary)] truncate">
                      mcp://pricing.acme.com
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-[8px] text-[var(--text-muted)] uppercase">Description</span>
                  <div className="text-[10px] text-[var(--text-secondary)] truncate">
                    Internal pricing lookups
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Agent Description
              </label>
              <div className="w-full p-2.5 border border-[var(--border)] rounded-md bg-[var(--bg-subtle)] text-sm min-h-[70px] text-[var(--text-secondary)]">
                Customer support agent for AcmeCorp. Handles order inquiries, refunds, shipping
                questions. Should be helpful but never reveal internal processes.
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Test Count" value="50" />
              <FormField label="Timeout" value="30s" />
            </div>
          </div>

          {/* Right - Integration Map */}
          <div className="bg-[var(--bg-subtle)] rounded-lg p-3 flex flex-col min-h-0">
            <div className="mb-3">
              <h4 className="font-display text-sm font-semibold">Integration Map</h4>
              <p className="text-xs text-[var(--text-muted)]">Select source to bridge connection</p>
            </div>

            {/* Connection Visualization */}
            <div className="flex-1 flex items-center justify-center relative py-4">
              {/* TensorEval Node */}
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-[var(--primary)]"
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </motion.div>
                <span className="text-[9px] font-semibold text-[var(--primary)] mt-2 uppercase tracking-wide">
                  TensorEval
                </span>

                {/* Floating icons around TensorEval */}
                <motion.div
                  animate={{ y: [0, -3, 0], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  className="absolute -left-1 top-1/2 -translate-y-6 w-4 h-4 bg-gray-200 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, 3, 0], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="absolute left-2 top-1/2 translate-y-4 w-6 h-6 bg-[var(--primary)]/20 rounded-lg flex items-center justify-center"
                >
                  <span className="text-[var(--primary)] text-xs">⚡</span>
                </motion.div>
              </div>

              {/* Connection Line */}
              <div className="mx-4 flex items-center">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-8 border-t-2 border-dashed border-gray-300"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mx-1"
                >
                  <span className="text-[10px] text-gray-400">↻</span>
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="w-8 border-t-2 border-dashed border-gray-300"
                />
              </div>

              {/* Your Agent Node */}
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="w-14 h-14 border-2 border-dashed border-[var(--primary)] rounded-xl flex items-center justify-center bg-white"
                >
                  <span className="text-[var(--primary)] text-xl">🤖</span>
                </motion.div>
                <span className="text-[9px] font-semibold text-[var(--primary)] mt-2 uppercase tracking-wide">
                  Your Agent
                </span>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-between py-2 border-t border-[var(--border-light)]">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-[var(--accent-green)]"
                />
                <span className="text-xs font-medium">
                  API Connection
                  <br />
                  <span className="text-[var(--accent-green)]">Active</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <span>⚡</span>
                <span>
                  <strong className="text-[var(--foreground)]">42ms</strong> latency
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[var(--primary)]/5 rounded-lg p-2.5 mt-2">
              <div className="flex gap-2">
                <span className="text-[var(--primary)] text-sm">ℹ</span>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                  The connection map visualizes how TensorEval interacts with your agent via the
                  specified API endpoint. Ensure CORS is enabled if using browser-based testing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function QueryGeneratorScreen() {
  // Agent configurations for all 3 agent types
  const agents = [
    {
      name: 'Browser Agent',
      iconBg: '#e0f2fe',
      iconColor: '#0ea5e9',
      capabilities: ['DOM Tree Access', 'Event Listeners', 'Network Intercept'],
      icon: (
        <svg
          className="w-3 h-3"
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
          className="w-3 h-3"
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
          className="w-3 h-3"
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
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <>
      <WindowHeader title="Synthetic Query Generation" />
      <div className="h-[calc(100%-44px)] flex bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] overflow-hidden px-3 py-2">
        {/* Three Column Layout */}
        <div className="flex-1 grid grid-cols-[0.8fr_1.3fr_1fr] gap-2 items-center">
          {/* Left Column - Stacked Agent Cards */}
          <div className="flex flex-col gap-1.5 justify-center">
            {agents.map((agent, agentIdx) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, delay: agentIdx * 0.1 }}
                className="rounded-[8px] border border-gray-100 bg-white p-1.5"
              >
                {/* Agent Header */}
                <div className="flex items-center gap-1.5 mb-1">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: agentIdx * 0.3,
                    }}
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: agent.iconBg }}
                  >
                    <span style={{ color: agent.iconColor }}>{agent.icon}</span>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate font-display text-[9px] font-bold text-gray-900">
                      {agent.name}
                    </h4>
                    <div className="flex items-center gap-0.5">
                      <motion.span
                        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: agentIdx * 0.2 }}
                        className="w-1 h-1 rounded-full bg-[#22c55e]"
                      />
                      <p className="text-[7px] text-gray-400">Active</p>
                    </div>
                  </div>
                </div>

                {/* Capabilities - compact text list */}
                <div className="flex flex-wrap gap-x-1.5 gap-y-0 pl-0.5">
                  {agent.capabilities.map((cap, idx) => (
                    <motion.span
                      key={cap}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + agentIdx * 0.1 + idx * 0.05 }}
                      className="text-[7px] text-gray-500"
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
            <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-36 -ml-1 overflow-visible">
              {/* Top line - from Browser Agent */}
              <motion.path
                d="M 0 5 Q 8 5, 16 22 L 24 58"
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
                d="M 0 72 L 24 72"
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
                d="M 0 139 Q 8 139, 16 122 L 24 86"
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
                r="2.5"
                fill="var(--brand-secondary)"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [0, 12, 24],
                  cy: [5, 14, 58],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Animated dot for middle line */}
              <motion.circle
                r="2.5"
                fill="var(--brand-secondary)"
                animate={{ cx: [0, 24], cy: [72, 72] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
              />
              {/* Animated dot for bottom line */}
              <motion.circle
                r="2.5"
                fill="var(--brand-secondary)"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [0, 12, 24],
                  cy: [139, 130, 86],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1, ease: 'easeInOut' }}
              />
            </svg>

            {/* Animated dashed lines to right cards */}
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-36 -mr-1 overflow-visible">
              {/* Top line */}
              <motion.path
                d="M 0 30 Q 10 30, 18 12 L 24 4"
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
                d="M 0 72 L 24 72"
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
                d="M 0 114 Q 10 114, 18 132 L 24 140"
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
                r="2"
                fill="var(--brand-secondary)"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [0, 12, 24],
                  cy: [30, 21, 4],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.circle
                r="2"
                fill="var(--brand-secondary)"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [0, 12, 24],
                  cy: [72, 72, 72],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
              <motion.circle
                r="2"
                fill="var(--brand-secondary)"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [0, 12, 24],
                  cy: [114, 123, 140],
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
              className="z-20 mb-1.5 rounded-full bg-[var(--brand-secondary)] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white"
            >
              Processing Engine
            </motion.div>

            {/* Engine Card with Dashed Border */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-2 w-full"
            >
              {/* Gear Icon with rotation */}
              <div className="flex justify-center mb-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--brand-highlight)]/30 bg-[var(--surface-container-low)]"
                >
                  <svg
                    className="h-5 w-5 text-[var(--brand-secondary)]"
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
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-medium text-gray-600">Synthesis Pipeline</span>
                  <span className="text-[8px] font-semibold">
                    <span className="text-[var(--brand-secondary)]">STEP</span>{' '}
                    <span className="text-gray-400">03/04</span>
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
              <div className="flex justify-center gap-1">
                {datasets.map((ds, idx) => (
                  <motion.div
                    key={ds.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className={`flex items-center gap-0.5 px-1.5 py-1 rounded-full text-[7px] font-medium border cursor-pointer transition-colors ${
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
          <div className="flex flex-col gap-1.5">
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
                className="relative cursor-pointer rounded-[8px] border border-gray-100 bg-white p-2"
              >
                {/* Category Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.15, type: 'spring', stiffness: 500 }}
                  className="inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold mb-0.5"
                  style={{
                    backgroundColor: `${item.categoryColor}15`,
                    color: item.categoryColor,
                  }}
                >
                  {item.category}
                </motion.div>
                {/* Query Text */}
                <p className="text-[9px] text-gray-600 leading-relaxed pr-4">{item.query}</p>
                {/* Animated Checkmark */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8 + idx * 0.15, type: 'spring', stiffness: 500 }}
                  className="absolute right-2 top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#22c55e]"
                >
                  <Check className="w-2 h-2 text-white" strokeWidth={3} />
                </motion.div>
              </motion.div>
            ))}

            {/* Analyzing State with typing animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-1 pl-0.5 mt-0.5"
            >
              <motion.div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -2, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-0.5 h-0.5 rounded-full bg-gray-400"
                  />
                ))}
              </motion.div>
              <span className="text-[8px] text-gray-400 italic">
                Generating synthetic queries...
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

function RunningScreen() {
  // Active test showing detailed tool call flow
  const activeTest = {
    id: 'ID-103',
    name: 'Multi-Tool Orchestration',
    status: 'running',
    agentToolCalls: [
      { tool: 'search_orders', status: 'complete', result: '3 orders found' },
      { tool: 'get_customer_profile', status: 'complete', result: 'Profile loaded' },
      { tool: 'check_refund_eligibility', status: 'running', result: null },
    ],
    evalToolCalls: [
      { tool: 'verify_tool_sequence', status: 'complete', passed: true },
      { tool: 'check_param_accuracy', status: 'running', passed: null },
    ],
  };

  // Mini test cards for the queue
  const miniTests = [
    { id: 'ID-101', status: 'success' as const, tools: 2 },
    { id: 'ID-102', status: 'success' as const, tools: 3 },
    { id: 'ID-104', status: 'running' as const, tools: 1 },
    { id: 'ID-105', status: 'queued' as const, tools: 0 },
    { id: 'ID-106', status: 'queued' as const, tools: 0 },
  ];

  return (
    <>
      <WindowHeader title="Evaluation Running" />
      <div className="p-4 h-[calc(100%-44px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full"
            />
            <div>
              <h3 className="font-display text-sm font-bold">Running Parallel Tests</h3>
              <p className="text-[10px] text-[var(--text-muted)]">
                Scraping agent with MCP tools • Capturing tool calls
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">
              <span className="text-[var(--accent-green)]">12</span>
              <span className="text-[var(--text-muted)]">/47</span>
            </p>
            <p className="text-[9px] text-[var(--text-muted)]">tests complete</p>
          </div>
        </div>

        {/* Main Content: Two Column Layout */}
        <div className="flex-1 grid grid-cols-[1.4fr_0.6fr] gap-3 min-h-0">
          {/* Left: Active Test Detail */}
          <div className="bg-[var(--bg-subtle)] rounded-lg p-3 flex flex-col min-h-0">
            {/* Test Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--primary)]">{activeTest.id}</span>
                <span className="text-xs font-medium">{activeTest.name}</span>
              </div>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-[9px] font-semibold uppercase"
              >
                Executing
              </motion.span>
            </div>

            {/* Two-Panel Flow */}
            <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
              {/* Agent Tool Calls Panel */}
              <div className="bg-white rounded-md border border-[var(--border-light)] p-2 flex flex-col min-h-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs">🤖</span>
                  <span className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Agent Tool Calls
                  </span>
                </div>
                <div className="flex-1 space-y-1.5 overflow-hidden">
                  {activeTest.agentToolCalls.map((call, idx) => (
                    <motion.div
                      key={call.tool}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[8px] ${
                          call.status === 'complete'
                            ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
                            : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        }`}
                      >
                        {call.status === 'complete' ? (
                          '✓'
                        ) : (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            ↻
                          </motion.span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono font-medium truncate">{call.tool}()</p>
                        {call.result && (
                          <p className="text-[9px] text-[var(--text-muted)] truncate">
                            {call.result}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Connection line to eval panel */}
                <div className="flex items-center justify-center py-1">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[10px] text-[var(--text-muted)]"
                  >
                    ━━ Captured ━▶
                  </motion.div>
                </div>
              </div>

              {/* Evaluator Verification Panel */}
              <div className="bg-white rounded-md border border-[var(--primary)]/20 p-2 flex flex-col min-h-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs">🔍</span>
                  <span className="text-[9px] font-semibold text-[var(--primary)] uppercase tracking-wider">
                    Evaluator Checks
                  </span>
                </div>
                <div className="flex-1 space-y-1.5 overflow-hidden">
                  {activeTest.evalToolCalls.map((call, idx) => (
                    <motion.div
                      key={call.tool}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.15 }}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[8px] ${
                          call.status === 'complete'
                            ? call.passed
                              ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
                              : 'bg-red-100 text-red-500'
                            : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        }`}
                      >
                        {call.status === 'complete' ? (
                          call.passed ? (
                            '✓'
                          ) : (
                            '✗'
                          )
                        ) : (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            ↻
                          </motion.span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono font-medium truncate">{call.tool}()</p>
                        <p className="text-[9px] text-[var(--text-muted)]">
                          {call.status === 'complete'
                            ? call.passed
                              ? 'Passed'
                              : 'Failed'
                            : 'Verifying...'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {/* Pending checks */}
                  <div className="flex items-center gap-2 opacity-40">
                    <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-[8px] text-gray-400">
                      ○
                    </div>
                    <p className="text-[10px] font-mono text-gray-400">validate_response()</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MCP Tools Connected */}
            <div className="mt-2 pt-2 border-t border-[var(--border-light)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-semibold text-[var(--text-muted)] uppercase">
                  MCP Tools:
                </span>
                <div className="flex gap-1">
                  {['search_orders', 'get_customer', 'refunds'].map((tool) => (
                    <span
                      key={tool}
                      className="px-1.5 py-0.5 bg-[var(--primary)]/5 text-[var(--primary)] rounded text-[8px] font-mono"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1 text-[9px] text-[var(--accent-green)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
                Connected
              </motion.div>
            </div>
          </div>

          {/* Right: Test Queue */}
          <div className="flex flex-col min-h-0">
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Test Queue
            </p>
            <div className="flex-1 space-y-1.5 overflow-hidden">
              {miniTests.map((test, idx) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-2 rounded-md border ${
                    test.status === 'running'
                      ? 'border-[var(--primary)]/30 bg-[var(--primary)]/5'
                      : test.status === 'success'
                        ? 'border-[var(--accent-green)]/30 bg-white'
                        : 'border-[var(--border-light)] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium">{test.id}</span>
                    <span
                      className={`text-[8px] font-semibold uppercase ${
                        test.status === 'success'
                          ? 'text-[var(--accent-green)]'
                          : test.status === 'running'
                            ? 'text-[var(--primary)]'
                            : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {test.status === 'running' ? (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          Running
                        </motion.span>
                      ) : (
                        test.status
                      )}
                    </span>
                  </div>
                  {test.tools > 0 && (
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5">
                      {test.tools} tool calls captured
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Progress Bar */}
        <div className="mt-3 pt-3 border-t border-[var(--border-light)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-4 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
                <span className="text-[var(--text-muted)]">8 Passed</span>
              </span>
              <span className="flex items-center gap-1">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-[var(--primary)]"
                />
                <span className="text-[var(--text-muted)]">4 Running</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-[var(--text-muted)]">35 Queued</span>
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">
              Avg: <strong className="text-[var(--foreground)]">3.2</strong> tool calls/test
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '17%' }}
              transition={{ duration: 1 }}
              className="bg-[var(--accent-green)] h-full"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '8.5%' }}
              transition={{ duration: 1, delay: 0.2 }}
              className="bg-[var(--primary)] h-full relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

function MetricsScreen() {
  const metrics = [
    {
      icon: '✓',
      iconBg: 'var(--primary)',
      name: 'Task Completion',
      desc: 'Percentage of successful task resolutions',
      value: '98.2%',
      status: 'EXCELLENT',
      statusColor: 'var(--accent-green)',
      trendColor: '#22c55e',
    },
    {
      icon: '📊',
      iconBg: 'var(--primary)',
      name: 'Accuracy',
      desc: 'Precision vs ground truth data',
      value: '94.2%',
      change: '+2.1%',
      status: 'PASSED',
      statusColor: 'var(--accent-green)',
      trendColor: 'var(--brand-secondary)',
    },
    {
      icon: '⏱',
      iconBg: '#f97316',
      name: 'Latency',
      desc: 'Avg response time per query',
      value: '1.2s',
      change: '-0.3s',
      status: 'EXCELLENT',
      statusColor: 'var(--accent-green)',
      trendColor: '#f97316',
    },
    {
      icon: '📋',
      iconBg: 'var(--accent-green)',
      name: 'Plan Quality',
      desc: 'Quality of action planning',
      value: '92%',
      status: 'EXCELLENT',
      statusColor: 'var(--accent-green)',
      trendColor: '#22c55e',
    },
    {
      icon: '🛡',
      iconBg: '#ef4444',
      name: 'Safety',
      desc: 'Jailbreak & PII leak protection',
      value: '100%',
      status: 'SECURE',
      statusColor: 'var(--accent-green)',
      trendColor: '#ef4444',
      flat: true,
    },
    {
      icon: '⚡',
      iconBg: 'var(--primary)',
      name: 'Efficiency',
      desc: 'Token-to-answer compression',
      value: '89%',
      status: 'STABLE',
      statusColor: '#6b7280',
      trendColor: 'var(--brand-highlight)',
    },
  ];

  return (
    <>
      <WindowHeader title="Evaluation Results" />
      <div className="p-4 h-[calc(100%-44px)] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-lg font-bold">Support Bot v2.4</h3>
              <span className="px-2 py-0.5 bg-[var(--accent-green)]/10 text-[var(--accent-green)] rounded text-[10px] font-semibold uppercase">
                Passed
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Run #2847 completed • Feb 24, 2024</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#f9fafb' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 rounded-[4px] border border-[var(--outline-variant)] bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface-container-low)]"
            >
              <motion.span whileHover={{ y: [0, -2, 0] }} transition={{ duration: 0.3 }}>
                📥
              </motion.span>{' '}
              Export PDF Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 rounded-[4px] bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--primary-dark)]"
            >
              Compare Versions
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[1.3fr_0.8fr_0.6fr_1fr] gap-2 px-3 py-2 text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-light)]">
          <span>Metric</span>
          <span>Current Score</span>
          <span>Status</span>
          <span className="text-right">Trend (Last 10 Runs)</span>
        </div>

        {/* Metrics Rows */}
        <div className="flex-1 divide-y divide-[var(--border-light)] overflow-hidden min-h-0">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="grid grid-cols-[1.3fr_0.8fr_0.6fr_1fr] gap-2 px-3 py-2.5 items-center"
            >
              {/* Metric Info */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: metric.iconBg }}
                >
                  {metric.icon}
                </div>
                <div>
                  <div className="text-sm font-medium">{metric.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{metric.desc}</div>
                </div>
              </div>

              {/* Score */}
              <div>
                <span className="text-lg font-bold">{metric.value}</span>
                {metric.change && (
                  <span
                    className={`text-[10px] ml-1 ${metric.change.startsWith('+') ? 'text-[var(--accent-green)]' : 'text-[var(--primary)]'}`}
                  >
                    {metric.change.startsWith('-') ? '↓' : '↑'} {metric.change}
                  </span>
                )}
              </div>

              {/* Status */}
              <span
                className="px-2 py-1 rounded text-[9px] font-semibold uppercase text-center"
                style={{
                  color: metric.statusColor,
                  backgroundColor: `color-mix(in srgb, ${metric.statusColor} 10%, transparent)`,
                }}
              >
                {metric.status}
              </span>

              {/* Trend Chart */}
              <div className="flex justify-end">
                <TrendLine color={metric.trendColor} flat={metric.flat} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border-light)]">
          <div className="flex gap-4 text-[10px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]"
              />{' '}
              47/47 queries safe
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" /> 0 jailbreak
              successes
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" /> 0 PII leaks
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Last synced: 2 minutes ago</span>
        </div>
      </div>
    </>
  );
}

function ABComparisonScreen() {
  const baselineMetrics = [
    { label: 'Task Completion', value: '88.5%' },
    { label: 'Accuracy', value: '92%' },
    { label: 'Latency', value: '1.5s' },
    { label: 'Plan Quality', value: '89%' },
    { label: 'Safety', value: '99.1%' },
    { label: 'Efficiency', value: '74%' },
  ];

  const candidateMetrics = [
    { label: 'Task Completion', value: '94.2%', change: '↑', positive: true },
    { label: 'Accuracy', value: '94%', change: '↑', positive: true },
    { label: 'Latency', value: '1.2s', change: '↓', positive: true },
    { label: 'Plan Quality', value: '92%', change: '↑', positive: true },
    { label: 'Safety', value: '99.8%', change: '↑', positive: true },
    { label: 'Efficiency', value: '86%', change: '↑', positive: true },
  ];

  return (
    <>
      <WindowHeader title="A/B Comparison Scorecard v2.3 vs v2.4" />
      <div className="p-4 h-[calc(100%-44px)] flex flex-col">
        {/* Comparison Cards */}
        <div className="flex-1 grid grid-cols-2 gap-3 mb-3 min-h-0">
          {/* Baseline v2.3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="flex min-h-0 flex-col rounded-[8px] border border-[var(--outline-variant)] bg-white p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold">v2.3</span>
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide px-2 py-0.5 bg-gray-100 rounded">
                Baseline
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              {baselineMetrics.map((metric, idx) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-[var(--text-secondary)]">{metric.label}</span>
                  <span className="font-semibold">{metric.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Winner v2.4 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="flex min-h-0 flex-col rounded-[8px] border-2 border-[var(--accent-green)] bg-[var(--accent-green)]/5 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold">v2.4</span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
                className="rounded-[4px] bg-[var(--accent-green)] px-2.5 py-1 text-xs font-semibold text-white"
              >
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block"
                >
                  🏆
                </motion.span>{' '}
                WINNER
              </motion.span>
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              {candidateMetrics.map((metric, idx) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-[var(--text-secondary)]">{metric.label}</span>
                  <span
                    className={`font-semibold ${metric.positive ? 'text-[var(--accent-green)]' : 'text-[var(--error)]'}`}
                  >
                    {metric.value}{' '}
                    <motion.span
                      animate={{ y: metric.positive ? [0, -2, 0] : [0, 2, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {metric.change}
                    </motion.span>
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Performance Divergence Chart */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Performance Divergence (100 Test Cases)
            </span>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-gray-100 text-[10px] font-medium rounded">
                Divergence point: +18.4%
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                <span className="w-3 h-0.5 bg-gray-300 rounded" /> v2.3
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                <span className="w-3 h-0.5 bg-[var(--primary)] rounded" /> v2.4
              </span>
            </div>
          </div>

          {/* Chart SVG */}
          <div className="h-[100px] relative">
            <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
              {/* v2.3 line (gray) */}
              <path
                d="M 0 60 Q 50 55, 100 50 T 200 45 T 300 48 T 400 40"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="2"
              />
              {/* v2.4 line (blue) */}
              <path
                d="M 0 65 Q 50 50, 100 40 T 200 25 T 300 15 T 400 12"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
              />
              {/* Divergence point marker on v2.4 */}
              <circle cx="280" cy="18" r="5" fill="var(--primary)" />
              {/* Divergence point marker on v2.3 */}
              <circle cx="280" cy="46" r="4" fill="#d1d5db" />
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-1">
              <span>CASE 1</span>
              <span>CASE 25</span>
              <span>CASE 50</span>
              <span>CASE 75</span>
              <span>CASE 100</span>
            </div>
          </div>
        </div>

        {/* Statistical Significance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 pt-2"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-3 w-3 rounded-full bg-[var(--accent-green)]"
          />
          <span className="text-sm font-medium">
            Statistical significance:
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-[var(--accent-green)] font-bold ml-1"
            >
              95.2%
            </motion.span>
          </span>
        </motion.div>
      </div>
    </>
  );
}

function ShipScreen() {
  const metrics = [
    { label: 'Task Completion', value: '98.5%', prefix: '' },
    { label: 'Accuracy', value: '94.2%', prefix: '' },
    { label: 'Latency', value: '1.2', prefix: '', suffix: 's' },
    { label: 'Plan Quality', value: '92%', prefix: '' },
    { label: 'Safety', value: '100%', prefix: '' },
    { label: 'Efficiency', value: '15.2%', prefix: '+' },
  ];

  return (
    <>
      <WindowHeader title="Ready to Ship" />
      <div className="p-4 h-[calc(100%-44px)] flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
        {/* Success Icon */}
        <div className="text-center mb-5">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative w-16 h-16 mx-auto mb-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[var(--accent-green)]/20 rounded-full"
            />
            <div className="absolute inset-1 bg-[var(--accent-green)]/10 rounded-full" />
            <div className="absolute inset-2 bg-[var(--accent-green)] rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold mb-1"
          >
            All Checks Passed
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-[var(--text-secondary)]"
          >
            Your agent is ready for production deployment
          </motion.p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-[var(--border-light)] rounded-lg p-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  {metric.label}
                </span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1, type: 'spring' }}
                  className="w-4 h-4 bg-[var(--accent-green)]/10 rounded-full flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-[var(--accent-green)]" />
                </motion.div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold">
                  <span className="text-sm font-normal text-[var(--text-muted)]">
                    {metric.prefix}
                  </span>
                  {metric.value}
                  {metric.suffix && (
                    <span className="text-sm font-normal text-[var(--text-muted)]">
                      {metric.suffix}
                    </span>
                  )}
                </span>
                <MiniTrendLine />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mb-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-[4px] border border-[var(--outline-variant)] bg-white px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--surface-container-low)]"
          >
            View Full Report
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-[4px] bg-[var(--accent-green)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              🚀
            </motion.span>
            Deploy to Production
          </motion.button>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-between items-center text-[10px] text-[var(--text-muted)] pt-3 border-t border-[var(--border-light)]"
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]"
              />
              Environment: <strong className="text-[var(--foreground)]">Production-ready</strong>
            </span>
            <span className="flex items-center gap-1">⏱ Last run: 2 mins ago</span>
          </div>
          <span>
            Agent Version: <strong className="text-[var(--foreground)]">v3.4.2-stable</strong>
          </span>
        </motion.div>
      </div>
    </>
  );
}

// Helper Components
function FormField({
  label,
  value,
  optional,
}: {
  label: string;
  value: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
        {label}{' '}
        {optional && <span className="font-normal text-[var(--text-muted)]">(optional)</span>}
      </label>
      <input
        type="text"
        value={value}
        readOnly
        className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-subtle)] text-sm"
      />
    </div>
  );
}

function TrendLine({ color, flat }: { color: string; flat?: boolean }) {
  // Generate random-ish points for the trend line
  const points = flat
    ? '0,15 20,15 40,15 60,15 80,15 100,15'
    : '0,25 15,22 30,18 50,20 65,12 80,8 100,5';

  return (
    <div className="w-20 h-6 relative overflow-hidden">
      <motion.svg
        className="w-full h-full"
        viewBox="0 0 100 30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  );
}

function MiniTrendLine() {
  return (
    <motion.div
      className="w-12 h-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <svg className="w-full h-full" viewBox="0 0 50 20">
        <motion.path
          d="M 0 15 Q 10 12, 20 10 T 35 6 T 50 4"
          fill="none"
          stroke="var(--accent-green)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  );
}
