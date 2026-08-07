export interface ShakeDetectorOptions {
  threshold: number;
  minGapMs: number;
  settleSamples: number;
  settleThreshold?: number;
  now?: () => number;
}

export function createShakeDetector(options: ShakeDetectorOptions): (magnitude: number) => boolean {
  const settleThreshold = options.settleThreshold ?? options.threshold * 0.6;
  const now = options.now ?? Date.now;
  let calmStreak = options.settleSamples;
  let lastFireTime = Number.NEGATIVE_INFINITY;

  return (magnitude: number): boolean => {
    if (magnitude > options.threshold) {
      if (now() - lastFireTime >= options.minGapMs && calmStreak >= options.settleSamples) {
        lastFireTime = now();
        calmStreak = 0;
        return true;
      }
      calmStreak = 0;
      return false;
    }
    calmStreak =
      magnitude < settleThreshold ? Math.min(calmStreak + 1, options.settleSamples) : 0;
    return false;
  };
}
