import { useState, useEffect } from "react";
import { BehaviorSubject, Subject } from "rxjs";
import storage from "@/data/persist";
import _ from "lodash";
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

export function createObservable<T>(initialValue: T): {
  get: () => T;
  set: (value: T) => void;
  update: (updater: (currentValue: T) => T) => void;
  wrapper: ObservableWrapper<T>;
} {
  const wrapper = new ObservableWrapper<T>(initialValue);

  const get = () => {
    return wrapper.getValue();
  };

  const set = (newValue: T) => {
    wrapper.setValue(newValue);
  };

  const update = (updater: (currentValue: T) => T) => {
    const currentValue = get();
    const newValue = updater(currentValue);
    set(newValue);
  };

  return { get, set, update, wrapper };
}

export function createPresistentObservable<T>(
  initialValue: T,
  options: {
    key?: string; // 用于本地存储的键名
    debounceTime?: number; // 防抖时间
  } = {}
): ReturnType<typeof createObservable<T>> {
  // 如果没有提供 key，则无法持久化
  if (!options.key) {
    return createObservable(initialValue);
  }

  // 尝试从 localStorage 获取已保存的值
  let savedValue: T;
  try {
    savedValue = storage.get(options.key) as T;
  } catch (e) {
    console.warn(`Failed to load persistent data for key ${options.key}:`, e);
    savedValue = initialValue;
  }

  // 创建 observable
  const observable = createObservable(savedValue);

  // 添加持久化订阅
  observable.wrapper.subscribe(
    _.debounce((value) => {
      try {
        storage.set(options.key!, value);
      } catch (e) {
        console.warn(
          `Failed to save persistent data for key ${options.key}:`,
          e
        );
      }
    }, options.debounceTime || 500)
  );

  return observable;
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
