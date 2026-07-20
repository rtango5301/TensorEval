'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Linkedin, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/logo';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Use Cases', href: '#use-cases' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Solutions: [
    { label: 'Browser Agents', href: '#use-cases' },
    { label: 'Data Analysis Agents', href: '#use-cases' },
    { label: 'Customer Support Agents', href: '#use-cases' },
    { label: 'Content Creation Agents', href: '#use-cases' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Contact', href: 'mailto:contact@tensoreval.com' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--outline-variant)] bg-[var(--background)] px-4 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-[1440px]">
        {/* Footer Grid */}
        <div className="mb-8 grid grid-cols-4 gap-6 lg:mb-12 lg:grid-cols-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-4 lg:col-span-6"
          >
            <Link href="/" className="mb-4 flex items-center text-[var(--foreground)] no-underline">
              <Logo size="sm" />
            </Link>
            <p className="text-sm text-[var(--text-secondary)] max-w-[280px] mb-4">
              Where AI agents go from experimental to enterprise-grade.
            </p>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[var(--accent-green)]" />
              <span className="text-sm text-[var(--text-secondary)]">All services are online</span>
            </div>
          </motion.div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.05 }}
              className="col-span-2"
            >
              <h4 className="mb-5 font-display text-sm font-semibold">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 border-t border-[var(--border-light)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            © 2025 TensorEval Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}
