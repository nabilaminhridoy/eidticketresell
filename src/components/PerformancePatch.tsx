'use client';

import { useEffect } from 'react';

/**
 * Patches performance.measure to prevent TypeError from React 19's
 * internal performance tracking when roots have negative timestamps.
 * This is a known issue with Next.js 16.x / React 19 where
 * performance.measure('RootNotFound', ...) can throw if the root
 * was never properly marked.
 */
export default function PerformancePatch() {
  useEffect(() => {
    const originalMeasure = performance.measure.bind(performance);

    const patchedMeasure = function (
      measureName: string,
      startOrOptions?: string | PerformanceMeasureOptions,
      endMark?: string
    ): PerformanceMeasure {
      try {
        // Call original measure - if it throws due to negative timestamp, we catch it
        return originalMeasure(measureName, startOrOptions as string, endMark);
      } catch (err: unknown) {
        // Only suppress the specific "negative time stamp" TypeError from React
        if (
          err instanceof TypeError &&
          (err.message.includes('negative time stamp') ||
            err.message.includes('cannot have a negative'))
        ) {
          // Return a synthetic empty measure so React doesn't break
          console.warn(
            `[PerformancePatch] Suppressed performance.measure error for "${measureName}": ${err.message}`
          );
          // Return a minimal PerformanceMeasure-like object
          return {
            name: measureName,
            entryType: 'measure',
            startTime: 0,
            duration: 0,
            detail: null,
          } as PerformanceMeasure;
        }
        // Re-throw all other errors
        throw err;
      }
    };

    // Override performance.measure with our patched version
    performance.measure = patchedMeasure as typeof performance.measure;

    // Cleanup on unmount (though this component should never unmount)
    return () => {
      performance.measure = originalMeasure;
    };
  }, []);

  // This component renders nothing
  return null;
}
