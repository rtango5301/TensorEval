'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  BarChart3,
  MessageSquare,
  PenLine,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const useCases = [
  {
    icon: Globe,
    title: 'Browser Agents',
    description: 'Eval navigation, form fills, multi-step workflows',
  },
  {
    icon: BarChart3,
    title: 'Data Analysis Agent',
    description: 'Validate SQL, charts, insight relevance',
  },
  {
    icon: MessageSquare,
    title: 'Customer Support Agent',
    description: 'Test response quality, tone, escalation',
  },
  {
    icon: PenLine,
    title: 'Content Creation Agent',
    description: 'Brand voice, factual accuracy, style',
  },
];

export function UseCases() {
  const [activeCase, setActiveCase] = useState(0);

  const goToNext = useCallback(() => {
    setActiveCase((prev) => (prev < useCases.length - 1 ? prev + 1 : prev));
  }, []);

  const goToPrev = useCallback(() => {
    setActiveCase((prev) => (prev > 0 ? prev - 1 : prev));
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
      id="use-cases"
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
            Use Cases
          </p>
          <h2 className="mb-3 font-display text-2xl font-bold tracking-tight md:text-3xl lg:mb-4 lg:text-4xl">
            Evaluate Any Agent, Any Workflow
          </h2>
          <p className="text-base lg:text-lg text-[var(--text-secondary)]">
            See how TensorEval adapts to different agent architectures
          </p>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-4 items-start gap-6 lg:grid-cols-12">
          {/* Use Case Cards */}
          <div className="col-span-4 grid grid-cols-2 gap-3 lg:col-span-5 lg:gap-5">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setActiveCase(index)}
                  onClick={() => setActiveCase(index)}
                  className={`cursor-pointer rounded-[8px] border bg-white p-4 transition-colors lg:p-7 ${
                    activeCase === index
                      ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                      : 'border-[var(--outline-variant)] hover:border-[var(--primary)]'
                  }`}
                >
                  <div className="mb-2 lg:mb-4">
                    <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-[var(--primary)]" />
                  </div>
                  <h4 className="mb-1 font-display text-sm font-bold lg:mb-2 lg:text-lg">
                    {useCase.title}
                  </h4>
                  <p className="text-xs lg:text-[15px] text-[var(--text-secondary)] leading-relaxed">
                    {useCase.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Use Case Screens with Navigation Arrows */}
          <div className="relative col-span-4 min-h-[400px] lg:col-span-7 lg:min-h-[580px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {activeCase === 0 && <BrowserAgentScreen />}
                {activeCase === 1 && <DataAgentScreen />}
                {activeCase === 2 && <SupportAgentScreen />}
                {activeCase === 3 && <ContentAgentScreen />}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <motion.button
              onClick={goToPrev}
              disabled={activeCase === 0}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute left-2 lg:-left-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                activeCase === 0
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white/80'
                  : 'border-[var(--primary)] text-[var(--primary)] bg-white hover:bg-[var(--primary)] hover:text-white'
              }`}
              aria-label="Previous use case"
            >
              <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            </motion.button>

            <motion.button
              onClick={goToNext}
              disabled={activeCase === useCases.length - 1}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute right-2 lg:-right-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                activeCase === useCases.length - 1
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white/80'
                  : 'border-[var(--primary)] text-[var(--primary)] bg-white hover:bg-[var(--primary)] hover:text-white'
              }`}
              aria-label="Next use case"
            >
              <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrowserAgentScreen() {
  const rubrics = [
    { action: 'Navigate to amazon.com', importance: 10, status: 'pass' as const },
    { action: 'Type "MacBook Pro" in search bar', importance: 10, status: 'pass' as const },
    { action: 'Click search button', importance: 8, status: 'pass' as const },
    {
      action: 'Select MacBook Pro 14" from results',
      importance: 10,
      status: 'evaluating' as const,
    },
    { action: 'Add to cart', importance: 10, status: 'pending' as const },
    { action: 'Proceed to checkout', importance: 9, status: 'pending' as const },
  ];

  const toolCalls = [
    { tool: 'navigate', args: 'amazon.com', status: 'captured', time: '1.2s' },
    { tool: 'click', args: 'input#search-box', status: 'captured', time: '0.3s' },
    { tool: 'type', args: '"MacBook Pro"', status: 'captured', time: '0.8s' },
    { tool: 'click', args: 'button#search-submit', status: 'captured', time: '0.2s' },
    { tool: 'click', args: 'div.product-card[0]', status: 'running', time: '...' },
  ];

  const domActions = [
    { action: 'Navigate: amazon.com', done: true },
    { action: 'Click: Search bar', done: true },
    { action: 'Type: "MacBook Pro"', done: true },
    { action: 'Click: Search button', done: true },
    { action: 'Selecting product...', done: false },
  ];

  return (
    <div className="flex h-[540px] flex-col overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--ui-header)] border-b border-[var(--ui-border)] flex-shrink-0">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[10px] text-[var(--text-muted)]">
            <Globe className="w-3 h-3" /> browser-agent.eval
          </div>
        </div>
        <span className="text-[8px] font-mono text-[var(--text-muted)] bg-gray-100 px-1.5 py-0.5 rounded">
          run_id: #BR-2847
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0">
        {/* Target Task Header */}
        <div className="mb-3 flex items-center justify-between rounded-[8px] border border-gray-100 bg-[var(--surface-container-low)] p-2.5">
          <div>
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Target Task
            </p>
            <p className="text-sm font-medium">&quot;Open Amazon and order MacBook Pro&quot;</p>
          </div>
          <motion.button
            whileTap={{ opacity: 0.9 }}
            className="flex items-center gap-1 rounded-[4px] bg-[var(--accent-green)] px-3 py-1.5 text-[10px] font-semibold text-white"
          >
            <motion.span
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ▶
            </motion.span>
            Trigger Evaluation
          </motion.button>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="grid grid-cols-[1fr_0.85fr_0.85fr] gap-2.5 mb-3 flex-1 min-h-0 overflow-hidden">
          {/* Left Column - Browser Mockup */}
          <div className="border border-[var(--border-light)] rounded-lg overflow-hidden relative">
            {/* Browser URL Bar */}
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 border-b border-gray-200">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
              <div className="flex-1 flex items-center bg-white rounded px-2 py-0.5 text-[7px] text-gray-500">
                🔒 amazon.com/s?k=macbook+pro
              </div>
            </div>

            {/* Amazon Header */}
            <div className="flex items-center gap-2 px-2 py-1.5 bg-[#131921]">
              <span className="text-[10px] font-bold text-white">amazon</span>
              <div className="flex-1 flex items-center bg-white rounded px-2 py-0.5">
                <span className="text-[8px] text-gray-700">MacBook Pro</span>
                <span className="ml-auto text-[#f90] text-[10px]">🔍</span>
              </div>
              <span className="text-[8px] text-white">🛒</span>
            </div>

            {/* Search Results */}
            <div className="p-2 bg-white">
              <p className="text-[7px] text-[var(--text-muted)] mb-1">
                1-3 of 48 results for &quot;MacBook Pro&quot;
              </p>

              {/* Product Cards */}
              <div className="space-y-1">
                {/* Product 1 - Selected */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1.5 p-1 border-2 border-[var(--primary)] rounded bg-[var(--primary)]/5 relative"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-500">
                    💻
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-medium truncate">MacBook Pro 14&quot; M3</p>
                    <span className="text-[#f90] text-[7px]">★★★★★</span>
                    <p className="text-[8px] font-bold">$1,999</p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -right-1 -top-1 w-3 h-3 bg-[var(--primary)] rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-[6px]">👆</span>
                  </motion.div>
                </motion.div>

                {/* Product 2 */}
                <div className="flex gap-1.5 p-1 border border-gray-100 rounded opacity-50">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-500">
                    💻
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-medium truncate">MacBook Pro 16&quot; M3 Pro</p>
                    <span className="text-[#f90] text-[7px]">★★★★★</span>
                    <p className="text-[8px] font-bold">$2,499</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluating Overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-2 top-8 z-10 flex items-center gap-1 rounded-full border border-gray-100 bg-white px-2 py-1"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-[var(--primary)] text-[10px]"
              >
                ↻
              </motion.span>
              <span className="text-[8px] font-medium">Evaluating...</span>
            </motion.div>

            {/* Live DOM Actions Panel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-1 left-1 rounded border bg-white p-1.5 text-[7px]"
            >
              <p className="font-semibold text-[var(--text-muted)] uppercase mb-1">DOM Actions</p>
              <div className="space-y-0.5">
                {domActions.map((item, idx) => (
                  <motion.div
                    key={item.action}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`flex items-center gap-1 ${item.done ? 'text-[var(--accent-green)]' : 'text-[var(--primary)]'}`}
                  >
                    {item.done ? (
                      <Check className="w-2 h-2" />
                    ) : (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="text-[8px]"
                      >
                        ◎
                      </motion.span>
                    )}
                    <span>{item.action}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Middle Column - Tool Calls & State Captures */}
          <div className="space-y-2">
            {/* Tool Calls Panel */}
            <div>
              <p className="text-[8px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Captured Tool Calls
              </p>
              <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                {toolCalls.map((call, idx) => (
                  <motion.div
                    key={`${call.tool}-${idx}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`flex items-center gap-1.5 px-2 py-1 border-b border-gray-100 last:border-b-0 ${
                      call.status === 'running' ? 'bg-[var(--primary)]/5' : ''
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        call.status === 'captured'
                          ? 'bg-[var(--accent-green)]'
                          : 'bg-[var(--primary)] animate-pulse'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-mono font-medium truncate">{call.tool}</p>
                      <p className="text-[7px] text-[var(--text-muted)] truncate">{call.args}</p>
                    </div>
                    <span
                      className={`text-[7px] ${
                        call.status === 'running'
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {call.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Evaluation Rubrics */}
          <div>
            <p className="text-[8px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Generated Rubrics
            </p>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              {rubrics.map((rubric, idx) => (
                <motion.div
                  key={rubric.action}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`flex items-center gap-1.5 px-1.5 py-1 border-b border-gray-50 last:border-b-0 ${
                    rubric.status === 'evaluating' ? 'bg-[var(--primary)]/5' : ''
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {rubric.status === 'pass' && (
                      <div className="w-3 h-3 bg-[var(--accent-green)] rounded-full flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    )}
                    {rubric.status === 'evaluating' && (
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-3 h-3 bg-[var(--primary)] rounded-full flex items-center justify-center"
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="text-white text-[6px]"
                        >
                          ↻
                        </motion.span>
                      </motion.div>
                    )}
                    {rubric.status === 'pending' && (
                      <div className="w-3 h-3 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[7px] truncate ${rubric.status === 'pending' ? 'text-[var(--text-muted)]' : ''}`}
                    >
                      {rubric.action}
                    </p>
                  </div>

                  {/* Weight Badge */}
                  <span
                    className={`text-[6px] font-semibold px-1 py-0.5 rounded ${
                      rubric.status === 'pass'
                        ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
                        : rubric.status === 'evaluating'
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {rubric.importance}/10
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluation Pipeline */}
        <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Evaluation Pipeline
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-[var(--text-muted)]">Stage 2 of 4</span>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[8px] text-[var(--primary)] font-medium"
              >
                Processing...
              </motion.span>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="flex items-center gap-1">
            {[
              { label: 'Capture', desc: 'Screenshots & DOM', done: true },
              { label: 'Ground Truth', desc: 'Generate rubrics', done: true },
              { label: 'Compare', desc: 'Match trajectory', active: true },
              { label: 'Score', desc: 'Final evaluation', pending: true },
            ].map((step, idx) => (
              <div key={step.label} className="flex-1 flex items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex-1 p-1.5 rounded text-center ${
                    step.done
                      ? 'bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30'
                      : step.active
                        ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
                        : 'bg-white border border-gray-200'
                  }`}
                >
                  <p
                    className={`text-[8px] font-semibold ${
                      step.done
                        ? 'text-[var(--accent-green)]'
                        : step.active
                          ? 'text-[var(--primary)]'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[6px] text-[var(--text-muted)]">{step.desc}</p>
                </motion.div>
                {idx < 3 && (
                  <div
                    className={`w-3 h-0.5 ${
                      step.done ? 'bg-[var(--accent-green)]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-6 gap-1.5 flex-shrink-0">
          {[
            { label: 'Rubrics', value: '3/6', extra: '✓', color: 'var(--accent-green)' },
            { label: 'Accuracy', value: '92.4%', color: 'var(--accent-green)' },
            { label: 'Latency', value: '2.5s', color: 'var(--foreground)' },
            { label: 'Cost', value: '$0.12', color: 'var(--foreground)' },
            { label: 'Safety', value: 'Pass', color: 'var(--accent-green)' },
            { label: 'Efficiency', value: 'HIGH', color: 'var(--primary)' },
          ].map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="rounded-[8px] border border-gray-100 bg-white p-1.5 text-center transition-colors hover:border-gray-200"
            >
              <p className="text-[6px] font-semibold text-[var(--text-muted)] uppercase mb-0.5">
                {metric.label}
              </p>
              <p className="text-[10px] font-bold" style={{ color: metric.color }}>
                {metric.value}
                {metric.extra && (
                  <span className="text-[var(--accent-green)] text-[8px] ml-0.5">
                    {metric.extra}
                  </span>
                )}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataAgentScreen() {
  const rubrics = [
    { action: 'Load users and orders datasets', importance: 10, status: 'pass' as const },
    { action: 'Filter users by signup_date (Jan 2024)', importance: 10, status: 'pass' as const },
    { action: 'Merge dataframes on user_id', importance: 9, status: 'pass' as const },
    { action: 'Calculate LTV using groupby + sum', importance: 9, status: 'evaluating' as const },
    { action: 'Sort results by LTV descending', importance: 8, status: 'pending' as const },
    { action: 'Return formatted output', importance: 7, status: 'pending' as const },
  ];

  const toolCalls = [
    { tool: 'read_csv', args: 'users.csv', status: 'captured', time: '0.12s' },
    { tool: 'read_csv', args: 'orders.csv', status: 'captured', time: '0.08s' },
    { tool: 'pd.merge', args: 'on=user_id', status: 'captured', time: '0.03s' },
    { tool: 'groupby.sum', args: 'order_total', status: 'running', time: '...' },
  ];

  const pythonLines = [
    {
      num: 1,
      code: (
        <>
          <span className="text-[#c678dd]">import</span>{' '}
          <span className="text-[#e5c07b]">pandas</span> <span className="text-[#c678dd]">as</span>{' '}
          <span className="text-[#e5c07b]">pd</span>
        </>
      ),
    },
    { num: 2, code: <></> },
    {
      num: 3,
      code: (
        <>
          <span className="text-[#7f848e]"># Load datasets</span>
        </>
      ),
    },
    {
      num: 4,
      code: (
        <>
          users = pd.<span className="text-[#61afef]">read_csv</span>(
          <span className="text-[#98c379]">&apos;users.csv&apos;</span>)
        </>
      ),
    },
    {
      num: 5,
      code: (
        <>
          orders = pd.<span className="text-[#61afef]">read_csv</span>(
          <span className="text-[#98c379]">&apos;orders.csv&apos;</span>)
        </>
      ),
    },
    { num: 6, code: <></> },
    {
      num: 7,
      code: (
        <>
          <span className="text-[#7f848e]"># Filter Jan 2024 signups</span>
        </>
      ),
    },
    { num: 8, code: <>jan_users = users[</> },
    {
      num: 9,
      code: (
        <>
          {' '}
          (users[<span className="text-[#98c379]">&apos;signup_date&apos;</span>] &gt;={' '}
          <span className="text-[#98c379]">&apos;2024-01-01&apos;</span>) &amp;
        </>
      ),
    },
    {
      num: 10,
      code: (
        <>
          {' '}
          (users[<span className="text-[#98c379]">&apos;signup_date&apos;</span>] &lt;={' '}
          <span className="text-[#98c379]">&apos;2024-01-31&apos;</span>)
        </>
      ),
    },
    { num: 11, code: <>]</> },
    { num: 12, code: <></> },
    {
      num: 13,
      code: (
        <>
          <span className="text-[#7f848e]"># Merge and calculate LTV</span>
        </>
      ),
    },
    {
      num: 14,
      code: (
        <>
          merged = pd.<span className="text-[#61afef]">merge</span>(jan_users, orders,{' '}
          <span className="text-[#d19a66]">on</span>=
          <span className="text-[#98c379]">&apos;user_id&apos;</span>)
        </>
      ),
    },
    {
      num: 15,
      code: (
        <>
          ltv = merged.<span className="text-[#61afef]">groupby</span>(
          <span className="text-[#98c379]">&apos;user_id&apos;</span>)[
          <span className="text-[#98c379]">&apos;order_total&apos;</span>]
        </>
      ),
    },
    {
      num: 16,
      code: (
        <>
          {' '}
          .<span className="text-[#61afef]">sum</span>().
          <span className="text-[#61afef]">sort_values</span>(
          <span className="text-[#d19a66]">ascending</span>=
          <span className="text-[#d19a66]">False</span>)
        </>
      ),
    },
  ];

  return (
    <div className="flex h-[540px] flex-col overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--ui-header)] border-b border-[var(--ui-border)] flex-shrink-0">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[10px] text-[var(--text-muted)]">
            <BarChart3 className="w-3 h-3" /> data-analyst-agent.eval
          </div>
        </div>
        <span className="text-[8px] font-mono text-[var(--text-muted)] bg-gray-100 px-1.5 py-0.5 rounded">
          run_id: #DA-7291
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0">
        {/* Target Task Header */}
        <div className="mb-3 flex items-center justify-between rounded-[8px] border border-gray-100 bg-[var(--surface-container-low)] p-2.5">
          <div>
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Input Query
            </p>
            <p className="text-sm font-medium">
              &quot;Calculate the LTV of users who signed up in Jan 2024&quot;
            </p>
          </div>
          <motion.button
            whileTap={{ opacity: 0.9 }}
            className="flex items-center gap-1 rounded-[4px] bg-[var(--accent-green)] px-3 py-1.5 text-[10px] font-semibold text-white"
          >
            <motion.span
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ▶
            </motion.span>
            Run Eval
          </motion.button>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="grid grid-cols-[1fr_0.85fr_0.85fr] gap-2.5 mb-3 flex-1 min-h-0 overflow-hidden">
          {/* Left Column - Python Code (Jupyter-like) */}
          <div className="border border-[var(--border-light)] rounded-lg overflow-hidden">
            {/* Notebook Header */}
            <div className="flex items-center justify-between px-2 py-1 bg-[#1e1e1e]">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-[#f9a825]">●</span>
                <span className="text-[8px] text-gray-400">analysis.ipynb</span>
              </div>
              <span className="text-[7px] text-gray-500 bg-gray-700 px-1 rounded">Python 3.11</span>
            </div>

            {/* Code Cell */}
            <div className="bg-[#282c34] font-mono text-[7px] text-[#abb2bf]">
              {/* Cell indicator */}
              <div className="flex">
                <div className="w-6 bg-[#1e1e1e] flex items-start justify-center pt-1.5">
                  <span className="text-[7px] text-[#61afef]">[1]</span>
                </div>
                <div className="flex-1 p-1.5">
                  {pythonLines.map((line, idx) => (
                    <motion.div
                      key={line.num}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="leading-relaxed"
                    >
                      {line.code}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Output Cell */}
              <div className="flex border-t border-[#3e4451]">
                <div className="w-6 bg-[#1e1e1e] flex items-start justify-center pt-1">
                  <span className="text-[7px] text-[#98c379]">Out</span>
                </div>
                <div className="flex-1 p-1.5 bg-[#1e1e1e]/50">
                  <p className="text-[7px] text-gray-500 mb-1">DataFrame (3 rows × 2 cols)</p>
                  <div className="text-[6px] font-mono">
                    <div className="grid grid-cols-3 gap-2 text-gray-500 border-b border-gray-700 pb-0.5 mb-0.5">
                      <span></span>
                      <span>user_id</span>
                      <span>ltv</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[#98c379]">
                      <span className="text-gray-500">0</span>
                      <span>usr_8472</span>
                      <span>4892.00</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[#98c379]">
                      <span className="text-gray-500">1</span>
                      <span>usr_1293</span>
                      <span>3241.50</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[#98c379]">
                      <span className="text-gray-500">2</span>
                      <span>usr_4821</span>
                      <span>2156.75</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Tool Calls & Captures */}
          <div className="space-y-2">
            {/* Tool Calls Panel */}
            <div>
              <p className="text-[8px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Captured Tool Calls
              </p>
              <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                {toolCalls.map((call, idx) => (
                  <motion.div
                    key={`${call.tool}-${idx}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`flex items-center gap-1.5 px-2 py-1 border-b border-gray-100 last:border-b-0 ${
                      call.status === 'running' ? 'bg-[var(--primary)]/5' : ''
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        call.status === 'captured'
                          ? 'bg-[var(--accent-green)]'
                          : 'bg-[var(--primary)] animate-pulse'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-mono font-medium truncate">{call.tool}</p>
                      <p className="text-[7px] text-[var(--text-muted)] truncate">{call.args}</p>
                    </div>
                    <span
                      className={`text-[7px] ${
                        call.status === 'running'
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {call.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Evaluation Rubrics */}
          <div>
            <p className="text-[8px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Generated Rubrics
            </p>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              {rubrics.map((rubric, idx) => (
                <motion.div
                  key={rubric.action}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`flex items-center gap-1.5 px-1.5 py-1 border-b border-gray-50 last:border-b-0 ${
                    rubric.status === 'evaluating' ? 'bg-[var(--primary)]/5' : ''
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {rubric.status === 'pass' && (
                      <div className="w-3 h-3 bg-[var(--accent-green)] rounded-full flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    )}
                    {rubric.status === 'evaluating' && (
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-3 h-3 bg-[var(--primary)] rounded-full flex items-center justify-center"
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="text-white text-[6px]"
                        >
                          ↻
                        </motion.span>
                      </motion.div>
                    )}
                    {rubric.status === 'pending' && (
                      <div className="w-3 h-3 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[7px] truncate ${rubric.status === 'pending' ? 'text-[var(--text-muted)]' : ''}`}
                    >
                      {rubric.action}
                    </p>
                  </div>

                  {/* Weight Badge */}
                  <span
                    className={`text-[6px] font-semibold px-1 py-0.5 rounded ${
                      rubric.status === 'pass'
                        ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
                        : rubric.status === 'evaluating'
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {rubric.importance}/10
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluation Pipeline - Enhanced */}
        <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Evaluation Pipeline
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-[var(--text-muted)]">Stage 2 of 4</span>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[8px] text-[var(--primary)] font-medium"
              >
                Processing...
              </motion.span>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="flex items-center gap-1">
            {[
              { label: 'Capture', desc: 'Tool calls & states', done: true },
              { label: 'Ground Truth', desc: 'Generate rubrics', done: true },
              { label: 'Compare', desc: 'Match trajectory', active: true },
              { label: 'Score', desc: 'Final evaluation', pending: true },
            ].map((step, idx) => (
              <div key={step.label} className="flex-1 flex items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex-1 p-1.5 rounded text-center ${
                    step.done
                      ? 'bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30'
                      : step.active
                        ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
                        : 'bg-white border border-gray-200'
                  }`}
                >
                  <p
                    className={`text-[8px] font-semibold ${
                      step.done
                        ? 'text-[var(--accent-green)]'
                        : step.active
                          ? 'text-[var(--primary)]'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[6px] text-[var(--text-muted)]">{step.desc}</p>
                </motion.div>
                {idx < 3 && (
                  <div
                    className={`w-3 h-0.5 ${
                      step.done ? 'bg-[var(--accent-green)]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-6 gap-1.5 flex-shrink-0">
          {[
            { label: 'Rubrics', value: '3/6', extra: '✓', color: 'var(--accent-green)' },
            { label: 'Accuracy', value: '98.2%', color: 'var(--accent-green)' },
            { label: 'Latency', value: '1.8s', color: 'var(--foreground)' },
            { label: 'Cost', value: '$0.03', color: 'var(--foreground)' },
            { label: 'Safety', value: 'No PII', color: 'var(--accent-green)' },
            { label: 'Efficiency', value: 'HIGH', color: 'var(--primary)' },
          ].map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="rounded-[8px] border border-gray-100 bg-white p-1.5 text-center transition-colors hover:border-gray-200"
            >
              <p className="text-[6px] font-semibold text-[var(--text-muted)] uppercase mb-0.5">
                {metric.label}
              </p>
              <p className="text-[10px] font-bold" style={{ color: metric.color }}>
                {metric.value}
                {metric.extra && (
                  <span className="text-[var(--accent-green)] text-[8px] ml-0.5">
                    {metric.extra}
                  </span>
                )}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SupportAgentScreen() {
  const rubrics = [
    { action: 'Acknowledge customer frustration', importance: 10, status: 'pass' as const },
    { action: 'Express empathy appropriately', importance: 9, status: 'pass' as const },
    { action: 'Apologize for poor experience', importance: 8, status: 'pass' as const },
    { action: 'Offer specific resolution (refund)', importance: 10, status: 'evaluating' as const },
    { action: 'Provide compensation for inconvenience', importance: 7, status: 'pending' as const },
    { action: 'Maintain professional tone throughout', importance: 9, status: 'pending' as const },
  ];

  const toolCalls = [
    {
      tool: 'analyze_sentiment',
      args: 'input_text',
      status: 'captured',
      result: 'angry, frustrated',
    },
    { tool: 'lookup_customer', args: 'email', status: 'captured', result: 'CUS-8472' },
    { tool: 'check_policy', args: 'refund_eligible', status: 'captured', result: 'true' },
    { tool: 'process_refund', args: 'order_id', status: 'running', result: '...' },
  ];

  const conversationSteps = [
    { step: 'Input received', done: true },
    { step: 'Sentiment: Angry 😠', done: true },
    { step: 'Policy lookup: Eligible', done: true },
    { step: 'Generating response...', done: false },
  ];

  return (
    <div className="flex h-[540px] flex-col overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--ui-header)] border-b border-[var(--ui-border)] flex-shrink-0">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[10px] text-[var(--text-muted)]">
            <MessageSquare className="w-3 h-3" /> support-agent.eval
          </div>
        </div>
        <span className="text-[8px] font-mono text-[var(--text-muted)] bg-gray-100 px-1.5 py-0.5 rounded">
          run_id: #CS-4820
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0">
        {/* Target Task Header */}
        <div className="mb-3 flex items-center justify-between rounded-[8px] border border-gray-100 bg-[var(--surface-container-low)] p-2.5">
          <div>
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Customer Query
            </p>
            <p className="text-sm font-medium">
              &quot;I want a refund, this product sucks and I&apos;m really angry...&quot;
            </p>
          </div>
          <motion.button
            whileTap={{ opacity: 0.9 }}
            className="flex items-center gap-1 rounded-[4px] bg-[var(--accent-green)] px-3 py-1.5 text-[10px] font-semibold text-white"
          >
            <motion.span
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ▶
            </motion.span>
            Run Eval
          </motion.button>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="grid grid-cols-[1fr_0.85fr_0.85fr] gap-2.5 mb-3 flex-1 min-h-0 overflow-hidden">
          {/* Left Column - Chat Interface Mockup */}
          <div className="border border-[var(--border-light)] rounded-lg overflow-hidden relative">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-[#1a1a2e]">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-[var(--primary)] rounded-full flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 text-white" />
                </div>
                <span className="text-[8px] text-white font-medium">Support Chat</span>
              </div>
              <span className="text-[7px] text-gray-400 bg-gray-700 px-1.5 rounded">Live</span>
            </div>

            {/* Chat Messages */}
            <div className="bg-gray-50 p-2 space-y-2">
              {/* Customer Message */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-1.5"
              >
                <div className="w-4 h-4 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-[6px]">
                  👤
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-1.5 max-w-[85%]">
                  <p className="text-[7px] text-gray-800 leading-relaxed">
                    I want a refund, this product sucks and I&apos;m really angry. I&apos;ve tried
                    reaching out three times and no one responds. This is unacceptable.
                  </p>
                  <p className="text-[6px] text-gray-400 mt-0.5">2:34 PM</p>
                </div>
              </motion.div>

              {/* Agent Response - Generating */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-1.5 justify-end"
              >
                <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-lg p-1.5 max-w-[85%]">
                  <p className="text-[7px] text-gray-800 leading-relaxed">
                    I&apos;m truly sorry to hear about your frustrating experience. I completely
                    understand how upsetting this must be, especially after multiple attempts to
                    reach us.
                  </p>
                  <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-[7px] text-[var(--primary)] mt-1"
                  >
                    I&apos;ve already initiated a full refund for your order...
                  </motion.p>
                  <p className="text-[6px] text-[var(--primary)] mt-0.5 flex items-center gap-0.5">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ↻
                    </motion.span>
                    Agent generating...
                  </p>
                </div>
                <div className="w-4 h-4 bg-[var(--primary)] rounded-full flex-shrink-0 flex items-center justify-center text-[6px]">
                  🤖
                </div>
              </motion.div>
            </div>

            {/* Evaluating Overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-2 top-8 z-10 flex items-center gap-1 rounded-full border border-gray-100 bg-white px-2 py-1"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-[var(--primary)] text-[10px]"
              >
                ↻
              </motion.span>
              <span className="text-[8px] font-medium">Evaluating...</span>
            </motion.div>

            {/* Live Conversation Steps */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-1 left-1 rounded border bg-white p-1.5 text-[7px]"
            >
              <p className="font-semibold text-[var(--text-muted)] uppercase mb-1">
                Agent Workflow
              </p>
              <div className="space-y-0.5">
                {conversationSteps.map((item, idx) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`flex items-center gap-1 ${item.done ? 'text-[var(--accent-green)]' : 'text-[var(--primary)]'}`}
                  >
                    {item.done ? (
                      <Check className="w-2 h-2" />
                    ) : (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="text-[8px]"
                      >
                        ◎
                      </motion.span>
                    )}
                    <span>{item.step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Middle Column - Tool Calls & State Captures */}
          <div className="space-y-2">
            {/* Tool Calls Panel */}
            <div>
              <p className="text-[8px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Captured Tool Calls
              </p>
              <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                {toolCalls.map((call, idx) => (
                  <motion.div
                    key={`${call.tool}-${idx}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`flex items-center gap-1.5 px-2 py-1 border-b border-gray-100 last:border-b-0 ${
                      call.status === 'running' ? 'bg-[var(--primary)]/5' : ''
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        call.status === 'captured'
                          ? 'bg-[var(--accent-green)]'
                          : 'bg-[var(--primary)] animate-pulse'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-mono font-medium truncate">{call.tool}</p>
                      <p className="text-[7px] text-[var(--text-muted)] truncate">{call.args}</p>
                    </div>
                    <span
                      className={`text-[7px] font-mono ${
                        call.status === 'running'
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--accent-green)]'
                      }`}
                    >
                      {call.result}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Evaluation Rubrics */}
          <div>
            <p className="text-[8px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Generated Rubrics
            </p>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              {rubrics.map((rubric, idx) => (
                <motion.div
                  key={rubric.action}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`flex items-center gap-1.5 px-1.5 py-1 border-b border-gray-50 last:border-b-0 ${
                    rubric.status === 'evaluating' ? 'bg-[var(--primary)]/5' : ''
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {rubric.status === 'pass' && (
                      <div className="w-3 h-3 bg-[var(--accent-green)] rounded-full flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    )}
                    {rubric.status === 'evaluating' && (
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-3 h-3 bg-[var(--primary)] rounded-full flex items-center justify-center"
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="text-white text-[6px]"
                        >
                          ↻
                        </motion.span>
                      </motion.div>
                    )}
                    {rubric.status === 'pending' && (
                      <div className="w-3 h-3 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[7px] truncate ${rubric.status === 'pending' ? 'text-[var(--text-muted)]' : ''}`}
                    >
                      {rubric.action}
                    </p>
                  </div>

                  {/* Weight Badge */}
                  <span
                    className={`text-[6px] font-semibold px-1 py-0.5 rounded ${
                      rubric.status === 'pass'
                        ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
                        : rubric.status === 'evaluating'
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {rubric.importance}/10
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluation Pipeline */}
        <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Evaluation Pipeline
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-[var(--text-muted)]">Stage 2 of 4</span>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[8px] text-[var(--primary)] font-medium"
              >
                Processing...
              </motion.span>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="flex items-center gap-1">
            {[
              { label: 'Capture', desc: 'Tool calls & context', done: true },
              { label: 'Ground Truth', desc: 'Generate rubrics', done: true },
              { label: 'Compare', desc: 'Match trajectory', active: true },
              { label: 'Score', desc: 'Final evaluation', pending: true },
            ].map((step, idx) => (
              <div key={step.label} className="flex-1 flex items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex-1 p-1.5 rounded text-center ${
                    step.done
                      ? 'bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30'
                      : step.active
                        ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
                        : 'bg-white border border-gray-200'
                  }`}
                >
                  <p
                    className={`text-[8px] font-semibold ${
                      step.done
                        ? 'text-[var(--accent-green)]'
                        : step.active
                          ? 'text-[var(--primary)]'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[6px] text-[var(--text-muted)]">{step.desc}</p>
                </motion.div>
                {idx < 3 && (
                  <div
                    className={`w-3 h-0.5 ${
                      step.done ? 'bg-[var(--accent-green)]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-6 gap-1.5 flex-shrink-0">
          {[
            { label: 'Rubrics', value: '3/6', extra: '✓', color: 'var(--accent-green)' },
            { label: 'Tone Score', value: '94%', color: 'var(--accent-green)' },
            { label: 'Latency', value: '0.8s', color: 'var(--foreground)' },
            { label: 'Escalation', value: 'None', color: 'var(--accent-green)' },
            { label: 'Policy', value: 'Compliant', color: 'var(--accent-green)' },
            { label: 'Resolution', value: 'Refund', color: 'var(--primary)' },
          ].map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="rounded-[8px] border border-gray-100 bg-white p-1.5 text-center transition-colors hover:border-gray-200"
            >
              <p className="text-[6px] font-semibold text-[var(--text-muted)] uppercase mb-0.5">
                {metric.label}
              </p>
              <p className="text-[10px] font-bold" style={{ color: metric.color }}>
                {metric.value}
                {metric.extra && (
                  <span className="text-[var(--accent-green)] text-[8px] ml-0.5">
                    {metric.extra}
                  </span>
                )}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentAgentScreen() {
  const rubrics = [
    { action: 'Generate headline copy from brief', importance: 10, status: 'pass' as const },
    {
      action: 'Apply brand color palette (#2563EB, #22C55E)',
      importance: 10,
      status: 'pass' as const,
    },
    { action: 'Include product name "Smart Sync"', importance: 9, status: 'pass' as const },
    { action: 'Add CTA button with action text', importance: 9, status: 'evaluating' as const },
    { action: 'Ensure text contrast ratio >= 4.5:1', importance: 8, status: 'pending' as const },
    { action: 'Export at 1200x630px (social standard)', importance: 7, status: 'pending' as const },
  ];

  const toolCalls = [
    { tool: 'parse_brief', args: 'product_launch.md', status: 'captured', time: '0.08s' },
    { tool: 'generate_copy', args: 'headline, tagline', status: 'captured', time: '1.2s' },
    { tool: 'create_layout', args: 'banner_1200x630', status: 'captured', time: '0.15s' },
    { tool: 'render_image', args: 'brand_assets/', status: 'running', time: '...' },
  ];

  const designSteps = [
    { action: 'Brief parsed', done: true },
    { action: 'Copy generated', done: true },
    { action: 'Layout created', done: true },
    { action: 'Rendering...', done: false },
  ];

  return (
    <div className="flex h-[540px] flex-col overflow-hidden rounded-[8px] border border-[var(--outline-variant)] bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--ui-header)] border-b border-[var(--ui-border)] flex-shrink-0">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[10px] text-[var(--text-muted)]">
            <PenLine className="w-3 h-3" /> content-creator-agent.eval
          </div>
        </div>
        <span className="text-[8px] font-mono text-[var(--text-muted)] bg-gray-100 px-1.5 py-0.5 rounded">
          run_id: #CC-3847
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0">
        {/* Target Task Header */}
        <div className="mb-3 flex items-center justify-between rounded-[8px] border border-gray-100 bg-[var(--surface-container-low)] p-2.5">
          <div>
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Target Task
            </p>
            <p className="text-sm font-medium">
              &quot;Design a product banner for Smart Sync launch&quot;
            </p>
          </div>
          <motion.button
            whileTap={{ opacity: 0.9 }}
            className="flex items-center gap-1 rounded-[4px] bg-[var(--accent-green)] px-3 py-1.5 text-[10px] font-semibold text-white"
          >
            <motion.span
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ▶
            </motion.span>
            Trigger Evaluation
          </motion.button>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="grid grid-cols-[1fr_0.85fr_0.85fr] gap-2.5 mb-3 flex-1 min-h-0 overflow-hidden">
          {/* Left Column - Design Preview Mockup */}
          <div className="border border-[var(--border-light)] rounded-lg overflow-hidden relative">
            {/* Design Canvas Header */}
            <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8]">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-white/80">🎨</span>
                <span className="text-[8px] text-white font-medium">Design Canvas</span>
              </div>
              <span className="text-[7px] text-white/70 bg-white/20 px-1 rounded">1200x630</span>
            </div>

            {/* Banner Preview */}
            <div className="bg-gradient-to-br from-[#2563EB] via-[#3b82f6] to-[#1d4ed8] p-3 min-h-[120px] relative">
              {/* Grid overlay for design feel */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Banner Content */}
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-2"
                >
                  <p className="text-[11px] font-bold text-white leading-tight">Smart Sync</p>
                  <p className="text-[8px] text-white/90 mt-0.5">
                    Your data, everywhere. Instantly.
                  </p>
                </motion.div>

                {/* CTA Button being rendered */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-1 rounded-[4px] bg-[var(--accent-green)] px-2 py-1 text-[8px] font-semibold text-white"
                >
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                  Try Free Today
                </motion.div>

                {/* Decorative elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute right-2 top-0 w-12 h-12 border border-white/20 rounded-full"
                />
                <div className="absolute right-4 top-2 w-6 h-6 bg-white/10 rounded-full" />
              </div>
            </div>

            {/* Evaluating Overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-2 top-8 z-10 flex items-center gap-1 rounded-full border border-gray-100 bg-white px-2 py-1"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-[var(--primary)] text-[10px]"
              >
                ↻
              </motion.span>
              <span className="text-[8px] font-medium">Evaluating...</span>
            </motion.div>

            {/* Live Design Steps Panel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-1 left-1 rounded border bg-white p-1.5 text-[7px]"
            >
              <p className="font-semibold text-[var(--text-muted)] uppercase mb-1">
                Design Pipeline
              </p>
              <div className="space-y-0.5">
                {designSteps.map((item, idx) => (
                  <motion.div
                    key={item.action}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`flex items-center gap-1 ${item.done ? 'text-[var(--accent-green)]' : 'text-[var(--primary)]'}`}
                  >
                    {item.done ? (
                      <Check className="w-2 h-2" />
                    ) : (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="text-[8px]"
                      >
                        ◎
                      </motion.span>
                    )}
                    <span>{item.action}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Middle Column - Tool Calls & Captures */}
          <div className="space-y-2">
            {/* Tool Calls Panel */}
            <div>
              <p className="text-[8px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Captured Tool Calls
              </p>
              <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                {toolCalls.map((call, idx) => (
                  <motion.div
                    key={`${call.tool}-${idx}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`flex items-center gap-1.5 px-2 py-1 border-b border-gray-100 last:border-b-0 ${
                      call.status === 'running' ? 'bg-[var(--primary)]/5' : ''
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        call.status === 'captured'
                          ? 'bg-[var(--accent-green)]'
                          : 'bg-[var(--primary)] animate-pulse'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-mono font-medium truncate">{call.tool}</p>
                      <p className="text-[7px] text-[var(--text-muted)] truncate">{call.args}</p>
                    </div>
                    <span
                      className={`text-[7px] ${
                        call.status === 'running'
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {call.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Evaluation Rubrics */}
          <div>
            <p className="text-[8px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Generated Rubrics
            </p>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              {rubrics.map((rubric, idx) => (
                <motion.div
                  key={rubric.action}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`flex items-center gap-1.5 px-1.5 py-1 border-b border-gray-50 last:border-b-0 ${
                    rubric.status === 'evaluating' ? 'bg-[var(--primary)]/5' : ''
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {rubric.status === 'pass' && (
                      <div className="w-3 h-3 bg-[var(--accent-green)] rounded-full flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    )}
                    {rubric.status === 'evaluating' && (
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-3 h-3 bg-[var(--primary)] rounded-full flex items-center justify-center"
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="text-white text-[6px]"
                        >
                          ↻
                        </motion.span>
                      </motion.div>
                    )}
                    {rubric.status === 'pending' && (
                      <div className="w-3 h-3 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[7px] truncate ${rubric.status === 'pending' ? 'text-[var(--text-muted)]' : ''}`}
                    >
                      {rubric.action}
                    </p>
                  </div>

                  {/* Weight Badge */}
                  <span
                    className={`text-[6px] font-semibold px-1 py-0.5 rounded ${
                      rubric.status === 'pass'
                        ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
                        : rubric.status === 'evaluating'
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {rubric.importance}/10
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluation Pipeline */}
        <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Evaluation Pipeline
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-[var(--text-muted)]">Stage 2 of 4</span>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[8px] text-[var(--primary)] font-medium"
              >
                Processing...
              </motion.span>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="flex items-center gap-1">
            {[
              { label: 'Capture', desc: 'Assets & tool calls', done: true },
              { label: 'Ground Truth', desc: 'Brand guidelines', done: true },
              { label: 'Compare', desc: 'Visual & text check', active: true },
              { label: 'Score', desc: 'Final brand score', pending: true },
            ].map((step, idx) => (
              <div key={step.label} className="flex-1 flex items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex-1 p-1.5 rounded text-center ${
                    step.done
                      ? 'bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30'
                      : step.active
                        ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
                        : 'bg-white border border-gray-200'
                  }`}
                >
                  <p
                    className={`text-[8px] font-semibold ${
                      step.done
                        ? 'text-[var(--accent-green)]'
                        : step.active
                          ? 'text-[var(--primary)]'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[6px] text-[var(--text-muted)]">{step.desc}</p>
                </motion.div>
                {idx < 3 && (
                  <div
                    className={`w-3 h-0.5 ${
                      step.done ? 'bg-[var(--accent-green)]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-6 gap-1.5 flex-shrink-0">
          {[
            { label: 'Rubrics', value: '3/6', extra: '✓', color: 'var(--accent-green)' },
            { label: 'Brand Match', value: '94.8%', color: 'var(--accent-green)' },
            { label: 'Latency', value: '2.1s', color: 'var(--foreground)' },
            { label: 'Cost', value: '$0.08', color: 'var(--foreground)' },
            { label: 'Accessibility', value: 'AA', color: 'var(--accent-green)' },
            { label: 'Quality', value: 'HIGH', color: 'var(--primary)' },
          ].map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="rounded-[8px] border border-gray-100 bg-white p-1.5 text-center transition-colors hover:border-gray-200"
            >
              <p className="text-[6px] font-semibold text-[var(--text-muted)] uppercase mb-0.5">
                {metric.label}
              </p>
              <p className="text-[10px] font-bold" style={{ color: metric.color }}>
                {metric.value}
                {metric.extra && (
                  <span className="text-[var(--accent-green)] text-[8px] ml-0.5">
                    {metric.extra}
                  </span>
                )}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
