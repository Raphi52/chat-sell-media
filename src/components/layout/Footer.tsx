"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { getCreator } from "@/lib/creators";

interface FooterProps {
  creatorSlug?: string;
}

export function Footer({ creatorSlug = "miacosta" }: FooterProps) {
  const creator = getCreator(creatorSlug);
  const basePath = `/${creatorSlug}`;

  const footerLinks = {
    product: [
      { href: `${basePath}/gallery`, label: "Gallery" },
      { href: `${basePath}/membership`, label: "Membership" },
    ],
    support: [
      { href: `${basePath}/faq`, label: "FAQ" },
      { href: `${basePath}/contact`, label: "Contact" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
    social: creator?.socialLinks ? Object.entries(creator.socialLinks).map(([key, url]) => ({
      href: url,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    })) : [],
  };

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={basePath} className="flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-[var(--gold)]" />
              <span className="text-xl font-semibold gradient-gold-text">
                {creator?.displayName || "Creator"}
              </span>
            </Link>
            <p className="text-sm text-[var(--muted)]">
              Premium exclusive content for discerning collectors.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {footerLinks.social.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">
                Social
              </h4>
              <ul className="space-y-2">
                {footerLinks.social.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <p className="text-center text-sm text-[var(--muted)]">
            &copy; {new Date().getFullYear()} {creator?.displayName || "Creator"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
