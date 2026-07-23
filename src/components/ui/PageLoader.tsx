'use client';

import { Ticket } from 'lucide-react';

/**
 * Professional branded loading screen for Eid Ticket Resell.
 * Uses CSS animations only (no framer-motion) for memory efficiency.
 */
export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] relative overflow-hidden">
      {/* Subtle gradient backdrop */}
      <div
        className="absolute inset-0 opacity-30 animate-loader-gradient"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(22,163,74,0.15) 0%, rgba(249,115,22,0.08) 40%, transparent 70%)',
        }}
      />

      {/* Decorative floating dots */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/20 animate-loader-dot-1" />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-orange/20 animate-loader-dot-2" />
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-blue/15 animate-loader-dot-3" />

      {/* Main content */}
      <div className="flex flex-col items-center gap-6 relative z-10 animate-loader-entrance">
        {/* Animated icon with orbiting ring */}
        <div className="relative flex items-center justify-center w-20 h-20">
          {/* Outer orbiting ring */}
          <div className="absolute inset-0 animate-loader-ring-spin">
            <div className="w-full h-full rounded-full border-2 border-dashed border-primary/30" />
          </div>

          {/* Inner pulsing ring */}
          <div className="absolute inset-2 rounded-full animate-loader-pulse-ring" />

          {/* Ticket icon */}
          <div className="animate-loader-icon-entrance">
            <Ticket className="w-10 h-10 text-primary drop-shadow-sm" strokeWidth={1.8} />
          </div>
        </div>

        {/* Brand name */}
        <div className="animate-loader-brand-entrance text-center">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            Eid Ticket Resell
          </h2>
          <p className="text-sm text-muted-foreground font-bangla mt-1">
            ঈদ টিকেট রিসেল
          </p>
        </div>

        {/* Loading indicator */}
        <div className="animate-loader-text-entrance flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-loader-bounce-dot-1" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-loader-bounce-dot-2" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-loader-bounce-dot-3" />
          </div>
          <p className="text-xs text-muted-foreground tracking-wide">Loading</p>
        </div>
      </div>
    </div>
  );
}
