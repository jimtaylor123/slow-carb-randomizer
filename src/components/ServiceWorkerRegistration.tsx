"use client";

import { useEffect } from "react";

let didReload = false;

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.()) return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext) return;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (didReload) return;
      didReload = true;
      window.location.reload();
    });

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
