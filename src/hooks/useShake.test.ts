import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useShake } from "./useShake";

describe("useShake hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("calls callback on manual trigger and enforces tap gap", () => {
    const onShake = vi.fn();
    const { result } = renderHook(() => useShake(onShake));

    act(() => {
      result.current.trigger();
    });
    expect(onShake).toHaveBeenCalledTimes(1);

    // Immediate second tap within 1200ms gap is ignored
    act(() => {
      result.current.trigger();
    });
    expect(onShake).toHaveBeenCalledTimes(1);

    // After tap gap expires, tap fires again
    act(() => {
      vi.advanceTimersByTime(1300);
      result.current.trigger();
    });
    expect(onShake).toHaveBeenCalledTimes(2);
  });

  it("handles devicemotion event with zero coordinate on web", () => {
    const onShake = vi.fn();
    renderHook(() => useShake(onShake, true));

    // Send devicemotion event with one axis as 0 and magnitude = 25 (> 18)
    const event = new Event("devicemotion") as DeviceMotionEvent;
    Object.defineProperty(event, "accelerationIncludingGravity", {
      value: { x: 25, y: 0, z: 0 },
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(onShake).toHaveBeenCalledTimes(1);
  });

  it("remounts cleanly and reattaches listener without getting stuck", () => {
    const onShake = vi.fn();
    const { unmount } = renderHook(() => useShake(onShake, true));

    unmount();

    // Re-render / mount again (as happens in React StrictMode)
    const { result: remountedResult } = renderHook(() => useShake(onShake, true));

    const event = new Event("devicemotion") as DeviceMotionEvent;
    Object.defineProperty(event, "accelerationIncludingGravity", {
      value: { x: 25, y: 0, z: 0 },
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(onShake).toHaveBeenCalledTimes(1);
    expect(remountedResult.current).toBeDefined();
  });

  it("refreshes listener when motion permission is granted", async () => {
    const onShake = vi.fn();
    const mockRequestPermission = vi.fn().mockResolvedValue("granted");

    Object.defineProperty(window, "DeviceMotionEvent", {
      configurable: true,
      value: Object.assign(function DeviceMotionEvent() {}, {
        requestPermission: mockRequestPermission,
      }),
    });

    const { result } = renderHook(() => useShake(onShake, true));
    expect(result.current.motionPermissionSupported).toBe(true);

    let granted = false;
    await act(async () => {
      granted = await result.current.requestMotionPermission();
    });

    expect(granted).toBe(true);
    expect(mockRequestPermission).toHaveBeenCalledTimes(1);

    const event = new Event("devicemotion") as DeviceMotionEvent;
    Object.defineProperty(event, "accelerationIncludingGravity", {
      value: { x: 25, y: 0, z: 0 },
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(onShake).toHaveBeenCalledTimes(1);
  });
});
