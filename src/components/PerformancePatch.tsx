/**
 * Patches performance.measure synchronously via an inline <script> in <head>
 * to prevent TypeError from React 19's internal performance tracking when
 * roots have negative timestamps (e.g., 'RootNotFound').
 *
 * This MUST run before React hydration starts, so we inject it as a
 * blocking <script> — not as a useEffect hook (which runs too late).
 */
export default function PerformancePatch() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  var originalMeasure = performance.measure.bind(performance);
  performance.measure = function patchedMeasure(measureName, startOrOptions, endMark) {
    try {
      return originalMeasure(measureName, startOrOptions, endMark);
    } catch (err) {
      if (err instanceof TypeError && (
        err.message.indexOf('negative time stamp') !== -1 ||
        err.message.indexOf('cannot have a negative') !== -1
      )) {
        console.warn('[PerformancePatch] Suppressed performance.measure error for "' + measureName + '": ' + err.message);
        return { name: measureName, entryType: 'measure', startTime: 0, duration: 0, detail: null };
      }
      throw err;
    }
  };
})();
`,
      }}
    />
  );
}
