'use client';

import { motion } from 'framer-motion';
import { useCalendly } from '@/hooks/use-calendly';

export function CTA() {
  const { openCalendly } = useCalendly();

  return (
    <section className="py-14 lg:py-[90px] px-4 sm:px-6 lg:px-8 bg-[var(--bg-subtle)]">
      <div className="max-w-[1080px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-[600px] mx-auto text-center"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 lg:mb-4 tracking-tight">
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
              className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Schedule a Demo
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
