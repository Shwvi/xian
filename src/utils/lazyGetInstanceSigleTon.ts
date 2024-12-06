export const lazyGetInstanceSigleTon = <T>(factory: () => T): (() => T) => {
  let instance: T | null = null;

  return () => {
    if (!instance) {
      instance = factory();
    }
    return instance;
  };
};
