"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Motion } from "@capacitor/motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { createShakeDetector } from "@/lib/shakeDetector";

const SHAKE_THRESHOLD = 18;
const SHAKE_GAP_MS = 1800;
const SETTLE_SAMPLES = 4;
const TAP_GAP_MS = 1200;

type MotionPermissionState = "granted" | "denied";

function canRequestMotionPermission(): boolean {
  if (typeof DeviceMotionEvent === "undefined") return false;
  const ctor = DeviceMotionEvent as unknown as {
    requestPermission?: () => Promise<MotionPermissionState>;
  };
  return typeof ctor?.requestPermission === "function";
}

async function buzz() {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // Haptics unavailable on web — ignore.
  }
}

/**
 * Detects a physical shake of the device.
 *
 * - Native (Capacitor): uses the @capacitor/motion accelerometer plugin.
 * - Web: falls back to the DeviceMotion API (with the iOS permission
 *   prompt handled by `requestMotionPermission`).
 *
 * Returns a manual `trigger` so a tap-to-shake button works everywhere
 * (desktop, simulators, devices without motion sensors).
 *
 * Motion samples are debounced by a settle-based detector so a single physical
 * shake fires once; `trigger` keeps its own smaller gap so tapping is not
 * throttled by the shake debounce.
 */
export function useShake(onShake: () => void, enabled = true) {
  const callbackRef = useRef(onShake);
  const lastTapRef = useRef(0);
  const listeningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = onShake;
  }, [onShake]);

  const detect = useMemo(
    () =>
      createShakeDetector({
        threshold: SHAKE_THRESHOLD,
        minGapMs: SHAKE_GAP_MS,
        settleSamples: SETTLE_SAMPLES,
      }),
    [],
  );

  const trigger = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < TAP_GAP_MS) return;
    lastTapRef.current = now;
    void buzz();
    callbackRef.current();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (listeningRef.current) return;

    const isNative = Capacitor.isNativePlatform();

    const handleMotion = (magnitude: number) => {
      if (!detect(magnitude)) return;
      void buzz();
      callbackRef.current();
    };

    const setupWeb = () => {
      const handler = (event: DeviceMotionEvent) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc?.x || !acc.y || !acc.z) return;
        handleMotion(Math.hypot(acc.x, acc.y, acc.z));
      };
      window.addEventListener("devicemotion", handler);
      listeningRef.current = true;
      return () => window.removeEventListener("devicemotion", handler);
    };

    let cleanup: () => void = () => {};
    if (isNative) {
      void Motion.addListener("accel", (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;
        handleMotion(Math.hypot(acc.x, acc.y, acc.z));
      });
      listeningRef.current = true;
      cleanup = () => {
        listeningRef.current = false;
        void Motion.removeAllListeners();
      };
    } else {
      cleanup = setupWeb();
    }

    return cleanup;
  }, [enabled, detect]);

  const requestMotionPermission = useCallback(async () => {
    if (!canRequestMotionPermission()) return true;
    const ctor = DeviceMotionEvent as unknown as {
      requestPermission: () => Promise<MotionPermissionState>;
    };
    const state = await ctor.requestPermission();
    return state === "granted";
  }, []);

  const motionPermissionSupported = useMemo(
    () => !Capacitor.isNativePlatform() && canRequestMotionPermission(),
    [],
  );

  return { trigger, requestMotionPermission, motionPermissionSupported };
}
