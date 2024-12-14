export const lazyGetInstanceSigleTon = <T>(factory: () => T): (() => T) => {
  let instance: T | null = null;

  return () => {
    if (!instance) {
      instance = factory();
    }
    return instance;
  };
};

export const lazyGetInstance = <T extends object>(factory: () => T): T => {
  let instance: T | null = null;

  return new Proxy({} as T, {
    get: (target, prop) => {
      if (!instance) {
        instance = factory();
      }
      return instance[prop as keyof T];
    },
  });
};
