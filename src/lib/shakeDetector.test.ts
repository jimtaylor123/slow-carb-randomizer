import { beforeEach, describe, expect, it } from "vitest";
import { createShakeDetector } from "./shakeDetector";

const THRESHOLD = 18;
const GAP = 1800;
const SAMPLES = 4;

describe("createShakeDetector", () => {
  let now: number;

  beforeEach(() => {
    now = 0;
  });

  const makeDetector = () =>
    createShakeDetector({
      threshold: THRESHOLD,
      minGapMs: GAP,
      settleSamples: SAMPLES,
      now: () => now,
    });

  const fire = (detect: (m: number) => boolean, magnitude: number, at: number) => {
    now = at;
    return detect(magnitude);
  };

  it("fires on the first sample above threshold", () => {
    const detect = makeDetector();
    expect(fire(detect, 30, 0)).toBe(true);
  });

  it("double spike after a gap yields exactly one fire", () => {
    const detect = makeDetector();
    expect(fire(detect, 30, 0)).toBe(true);
    expect(fire(detect, 30, 100)).toBe(false);
    expect(fire(detect, 30, 2000)).toBe(false);
  });

  it("spike, settle, then spike after the gap fires twice", () => {
    const detect = makeDetector();
    expect(fire(detect, 30, 0)).toBe(true);
    [500, 550, 600, 650].forEach((t) => fire(detect, 9, t));
    fire(detect, 8, 1900);
    expect(fire(detect, 30, 2000)).toBe(true);
  });

  it("sustained shaking fires exactly once", () => {
    const detect = makeDetector();
    expect(fire(detect, 30, 0)).toBe(true);
    [50, 100, 150, 200, 250].forEach((t) => fire(detect, 25, t));
    expect(detect(25)).toBe(false);
  });

  it("never fires below the threshold", () => {
    const detect = makeDetector();
    [0, 100, 200, 300].forEach((t) => fire(detect, 9.8, t));
    expect(detect(9.8)).toBe(false);
  });

  it("enforces minGapMs between fires", () => {
    const detect = makeDetector();
    expect(fire(detect, 30, 0)).toBe(true);
    [100, 150, 200, 250].forEach((t) => fire(detect, 9, t));
    expect(fire(detect, 30, 500)).toBe(false);
    [600, 650, 700, 750].forEach((t) => fire(detect, 9, t));
    expect(fire(detect, 30, 1700)).toBe(false);
    [1800, 1850, 1900, 1950].forEach((t) => fire(detect, 9, t));
    expect(fire(detect, 30, 2000)).toBe(true);
  });

  it("a non-settled (mid-range) sample resets the calm streak", () => {
    const detect = makeDetector();
    expect(fire(detect, 30, 0)).toBe(true);
    fire(detect, 9, 100);
    fire(detect, 8, 150);
    fire(detect, 14, 200);
    [250, 300, 350, 400].forEach((t) => fire(detect, 9, t));
    expect(fire(detect, 30, 2000)).toBe(true);
  });
});
