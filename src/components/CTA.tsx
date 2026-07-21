'use client';

import { motion } from 'framer-motion';
import { useCalendly } from '@/hooks/use-calendly';

export function CTA() {
  const { openCalendly } = useCalendly();

  return (
    <section className="bg-[var(--surface-container-low)] px-4 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-4 lg:grid-cols-12 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="col-span-4 mx-auto max-w-[600px] text-center lg:col-span-8 lg:col-start-3"
        >
          <h2 className="mb-3 font-display text-2xl font-bold tracking-tight md:text-3xl lg:mb-4 lg:text-4xl">
            Ready to stabilize your AI pipeline?
          </h2>
          <p className="text-base lg:text-lg text-[var(--text-secondary)] mb-6 lg:mb-8">
            Join hundreds of AI engineers who ship deterministic, high-quality agents every day with
            TensorEval.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCalendly}
              className="rounded-[4px] bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2"
            >
              Schedule a Demo
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
