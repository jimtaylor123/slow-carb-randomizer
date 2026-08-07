import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveSoundEnabled } from "./storage";

interface Param {
  value: number;
  setValueAtTime: ReturnType<typeof vi.fn>;
  exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
}

interface SourceNode {
  buffer: unknown;
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

interface FilterNode {
  type: string;
  frequency: Param;
  Q: Param;
  connect: ReturnType<typeof vi.fn>;
}

interface GainNode {
  gain: Param;
  connect: ReturnType<typeof vi.fn>;
}

interface OscNode {
  type: string;
  frequency: Param;
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

interface MockBuffer {
  channels: number;
  length: number;
  sampleRate: number;
  getChannelData: ReturnType<typeof vi.fn>;
}

class MockAudioContext {
  static instances: MockAudioContext[] = [];
  readonly buffers: MockBuffer[] = [];
  readonly sources: SourceNode[] = [];
  readonly filters: FilterNode[] = [];
  readonly gains: GainNode[] = [];
  readonly oscillators: OscNode[] = [];
  readonly sampleRate = 48000;
  readonly currentTime = 0;
  readonly state = "suspended";
  readonly destination = {};
  readonly resume = vi.fn(async () => undefined);

  constructor() {
    MockAudioContext.instances.push(this);
  }

  createBuffer(channels: number, length: number, sampleRate: number): MockBuffer {
    const buffer: MockBuffer = {
      channels,
      length,
      sampleRate,
      getChannelData: vi.fn(() => new Float32Array(length)),
    };
    this.buffers.push(buffer);
    return buffer;
  }

  createBufferSource(): SourceNode {
    const source: SourceNode = { buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
    this.sources.push(source);
    return source;
  }

  createBiquadFilter(): FilterNode {
    const filter: FilterNode = {
      type: "",
      frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      Q: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    this.filters.push(filter);
    return filter;
  }

  createGain(): GainNode {
    const node: GainNode = {
      gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    this.gains.push(node);
    return node;
  }

  createOscillator(): OscNode {
    const osc: OscNode = {
      type: "",
      frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    this.oscillators.push(osc);
    return osc;
  }
}

describe("sound", () => {
  beforeEach(() => {
    vi.resetModules();
    MockAudioContext.instances.length = 0;
    window.AudioContext = MockAudioContext as unknown as typeof AudioContext;
    window.localStorage.clear();
  });

  it("playRattle builds a bandpass noise burst with an envelope", async () => {
    const sound = await import("./sound");
    sound.playRattle();

    expect(MockAudioContext.instances).toHaveLength(1);
    const ctx = MockAudioContext.instances[0];
    expect(ctx.buffers[0].length).toBe(5760);
    expect(ctx.sources[0].buffer).toBe(ctx.buffers[0]);
    expect(ctx.filters[0].type).toBe("bandpass");
    expect(ctx.filters[0].frequency.value).toBe(2500);
    expect(ctx.filters[0].Q.value).toBe(1.2);
    expect(ctx.gains[0].gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.3, 0.005);
    expect(ctx.sources[0].start).toHaveBeenCalled();
    expect(ctx.sources[0].stop).toHaveBeenCalled();
  });

  it("playPop builds a rising sine gliss with an envelope", async () => {
    const sound = await import("./sound");
    sound.playPop();

    const ctx = MockAudioContext.instances[0];
    expect(ctx.oscillators[0].type).toBe("sine");
    expect(ctx.oscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(500, 0);
    expect(ctx.oscillators[0].frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(900, 0.08);
    expect(ctx.gains[0].gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.15, 0.01);
    expect(ctx.oscillators[0].start).toHaveBeenCalled();
    expect(ctx.oscillators[0].stop).toHaveBeenCalled();
  });

  it("unlock constructs and resumes the context", async () => {
    const sound = await import("./sound");
    sound.unlock();

    expect(MockAudioContext.instances).toHaveLength(1);
    expect(MockAudioContext.instances[0].resume).toHaveBeenCalled();
  });

  it("reuses a single context across calls", async () => {
    const sound = await import("./sound");
    sound.unlock();
    sound.playPop();
    sound.playRattle();

    expect(MockAudioContext.instances).toHaveLength(1);
  });

  it("is a no-op when sound is disabled", async () => {
    saveSoundEnabled(false);
    const sound = await import("./sound");
    sound.unlock();
    sound.playRattle();
    sound.playPop();

    expect(MockAudioContext.instances).toHaveLength(0);
  });

  it("is safe without a window (SSR)", async () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", { value: undefined, configurable: true });
    try {
      const sound = await import("./sound");
      sound.unlock();
      sound.playRattle();
      sound.playPop();
      expect(MockAudioContext.instances).toHaveLength(0);
    } finally {
      Object.defineProperty(globalThis, "window", { value: originalWindow, configurable: true });
    }
  });
});
