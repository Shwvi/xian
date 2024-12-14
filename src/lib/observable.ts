import { useState, useEffect } from "react";
import { BehaviorSubject, Subject } from "rxjs";

// 使用 BehaviorSubject 替代 ObservableWrapper
class ObservableWrapper<T> {
  private subject: BehaviorSubject<T>;

  constructor(initialValue: T) {
    this.subject = new BehaviorSubject<T>(initialValue);
  }

  getValue(): T {
    return this.subject.getValue();
  }

  setValue(newValue: T) {
    if (batchingUpdates) {
      pendingNotifications.add(() => this.subject.next(newValue));
    } else {
      this.subject.next(newValue);
    }
  }

  subscribe(subscriber: (value: T) => void) {
    const subscription = this.subject.subscribe(subscriber);
    return () => subscription.unsubscribe();
  }

  getObservable() {
    return this.subject;
  }
}

let batchingUpdates = false;
const pendingNotifications = new Set<() => void>();

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
      wrapper.setValue(wrapper.getValue());
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
