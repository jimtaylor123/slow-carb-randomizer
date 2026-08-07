"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Motion } from "@capacitor/motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const SHAKE_THRESHOLD = 18;
const MIN_GAP_MS = 1200;

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
 */
export function useShake(onShake: () => void, enabled = true) {
  const callbackRef = useRef(onShake);
  const lastTriggerRef = useRef(0);
  const listeningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = onShake;
  }, [onShake]);

  const fire = useCallback(() => {
    const now = Date.now();
    if (now - lastTriggerRef.current < MIN_GAP_MS) return;
    lastTriggerRef.current = now;
    void buzz();
    callbackRef.current();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (listeningRef.current) return;

    const isNative = Capacitor.isNativePlatform();

    const setupWeb = () => {
      const handler = (event: DeviceMotionEvent) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc?.x || !acc.y || !acc.z) return;
        const magnitude = Math.hypot(acc.x, acc.y, acc.z);
        if (magnitude > SHAKE_THRESHOLD) fire();
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
        const magnitude = Math.hypot(acc.x, acc.y, acc.z);
        if (magnitude > SHAKE_THRESHOLD) fire();
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
  }, [enabled, fire]);

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

  return { trigger: fire, requestMotionPermission, motionPermissionSupported };
}
