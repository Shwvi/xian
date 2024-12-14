export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface TimeoutControl {
  promise: Promise<void>;
  clear: () => void;
}

export function requestAnimationTimeOut(ms: number): TimeoutControl {
  let rafId: number;
  let resolver: (() => void) | null = null;

  const promise = new Promise<void>((resolve) => {
    resolver = resolve;
    const startTime = performance.now();

    function check() {
      const currentTime = performance.now();
      if (currentTime - startTime >= ms) {
        resolve();
      } else {
        rafId = requestAnimationFrame(check);
      }
    }
    rafId = requestAnimationFrame(check);
  });

  return {
    promise,
    clear: () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      resolver?.();
    },
  };
}
