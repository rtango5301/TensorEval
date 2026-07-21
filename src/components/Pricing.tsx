'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCalendly } from '@/hooks/use-calendly';

const pricingPlans = [
  {
    tier: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for side projects and experimentation',
    features: [
      '5 eval runs/month',
      '3 datasets/month',
      'Up to 20 queries per dataset',
      '1 agent',
      '30-day data retention',
    ],
    cta: 'Start Free',
    featured: false,
  },
  {
    tier: 'Teams & Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and organizations shipping production agents',
    features: [
      'Unlimited eval runs',
      'Unlimited datasets',
      'Up to 500 queries per dataset',
      'Unlimited agents',
      'CI/CD integrations',
      'A/B testing & data export',
      'SSO/SAML',
      'Dedicated support & SLA',
    ],
    cta: 'Book a Slot',
    featured: true,
  },
];

export function Pricing() {
  const router = useRouter();
  const { openCalendly } = useCalendly();

  return (
    <section
      id="pricing"
      className="scroll-mt-20 bg-[var(--background)] px-4 py-16 lg:px-10 lg:py-20"
    >
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
            Pricing
          </p>
          <h2 className="mb-3 font-display text-2xl font-bold tracking-tight md:text-3xl lg:mb-4 lg:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="text-base lg:text-lg text-[var(--text-secondary)] max-w-[600px] mx-auto">
            Start free, upgrade when you&apos;re ready.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="col-span-4 mx-auto grid w-full max-w-[700px] grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-8 lg:col-start-3 lg:gap-6">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex h-full flex-col rounded-[8px] border bg-white p-5 transition-colors lg:p-8 ${
                plan.featured
                  ? 'border-[var(--primary)] bg-[var(--surface-container-low)]'
                  : 'border-[var(--outline-variant)] hover:border-[var(--primary)]'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--primary)] text-white text-xs font-semibold rounded-full">
                  Most Popular
                </span>
              )}

              <p className="text-sm text-[var(--text-secondary)] mb-2">{plan.tier}</p>
              <div className="mb-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-[var(--text-muted)]">{plan.period}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-6 pb-6 border-b border-[var(--border-light)]">
                {plan.description}
              </p>

              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]"
                  >
                    <Check className="w-4 h-4 text-[var(--accent-green)] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (plan.cta === 'Start Free') {
                    router.push('/login');
                  } else if (plan.cta === 'Book a Slot') {
                    openCalendly();
                  }
                }}
                className={`w-full rounded-[4px] py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2 ${
                  plan.featured
                    ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                    : 'border border-[var(--primary)] bg-white text-[var(--primary)] hover:bg-[var(--surface-container-low)]'
                }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
