import { useState, useEffect } from "react";

type Subscriber = () => void;

// 创建一个包装器来处理所有值类型
class ObservableWrapper<T> {
  private value: T;
  private subscribers = new Set<Subscriber>();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  getValue(): T {
    return this.value;
  }

  setValue(newValue: T) {
    this.value = newValue;
    this.notify();
  }

  subscribe(subscriber: Subscriber) {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  private notify() {
    if (batchingUpdates) {
      this.subscribers.forEach((sub) => pendingNotifications.add(sub));
    } else {
      this.subscribers.forEach((sub) => sub());
    }
  }
}

let batchingUpdates = false;
const pendingNotifications = new Set<Subscriber>();

export function batch(fn: () => void) {
  batchingUpdates = true;
  fn();
  batchingUpdates = false;
  pendingNotifications.forEach((notify) => notify());
  pendingNotifications.clear();
}

function createDeepProxy<T extends object>(
  target: T,
  wrapper: ObservableWrapper<any>
): T {
  if (!target || typeof target !== "object") {
    return target;
  }

  const handler: ProxyHandler<T> = {
    get(target: T, property: string | symbol) {
      const value = Reflect.get(target, property);
      if (value && typeof value === "object") {
        return createDeepProxy(value, wrapper);
      }
      return value;
    },

    set(target: T, property: string | symbol, value: any) {
      const result = Reflect.set(target, property, value);
      wrapper.setValue(wrapper.getValue()); // 触发更新
      return result;
    },
  };

  return new Proxy(target, handler);
}

export function createObservable<T>(
  initialValue: T,
  options: { deep?: boolean } = {}
): { get: () => T; set: (value: T) => void; wrapper: ObservableWrapper<T> } {
  const wrapper = new ObservableWrapper<T>(initialValue);

  const get = () => {
    const value = wrapper.getValue();
    if (options.deep && value && typeof value === "object") {
      return createDeepProxy(value, wrapper);
    }
    return value;
  };

  const set = (newValue: T) => {
    wrapper.setValue(newValue);
  };

  return { get, set, wrapper };
}

export function useObservable<T>(
  observable: ReturnType<typeof createObservable<T>>
): T {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = observable.wrapper.subscribe(() => {
      forceUpdate({});
    });

    return () => {
      unsubscribe();
    };
  }, [observable]);

  return observable.get();
}
