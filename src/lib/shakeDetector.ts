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
  let isArmed = true;
  let calmStreak = options.settleSamples;
  let lastFireTime = Number.NEGATIVE_INFINITY;

  return (magnitude: number): boolean => {
    const currentTime = now();

    if (
      !isArmed &&
      calmStreak >= options.settleSamples &&
      currentTime - lastFireTime >= options.minGapMs
    ) {
      isArmed = true;
    }

    if (isArmed) {
      if (magnitude > options.threshold) {
        lastFireTime = currentTime;
        isArmed = false;
        calmStreak = 0;
        return true;
      }
      return false;
    }

    if (magnitude < settleThreshold) {
      calmStreak = Math.min(calmStreak + 1, options.settleSamples);
    } else {
      calmStreak = 0;
    }

    return false;
  };
}
