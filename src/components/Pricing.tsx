'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useRef } from 'react';

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
    };
  }
}

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
  const scriptLoaded = useRef(false);

  const openCalendly = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/evaltensor',
      });
    }
  };

  return (
    <section
      id="pricing"
      className="py-16 lg:py-[100px] px-4 lg:px-6 bg-[var(--background)] scroll-mt-20"
    >
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        onLoad={() => {
          scriptLoaded.current = true;
        }}
      />
      <link
        rel="stylesheet"
        href="https://assets.calendly.com/assets/external/widget.css"
      />
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <p className="text-base uppercase tracking-[0.2em] text-[var(--primary)] font-bold mb-4">
            Pricing
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 lg:mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-base lg:text-lg text-[var(--text-secondary)] max-w-[600px] mx-auto">
            Start free, upgrade when you&apos;re ready.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-[700px] mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative bg-white border rounded-2xl p-5 lg:p-8 transition-all duration-300 flex flex-col h-full ${
                plan.featured
                  ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/15'
                  : 'border-[var(--border)] hover:border-[var(--primary)] hover:shadow-lg hover:shadow-[var(--primary)]/15'
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
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  plan.featured
                    ? 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white shadow-sm hover:shadow-md hover:shadow-[var(--primary)]/30'
                    : 'bg-white hover:bg-[var(--primary)] text-[var(--foreground)] hover:text-white border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md hover:shadow-[var(--primary)]/30'
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
