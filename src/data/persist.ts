interface StorageInterface {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export enum StorageKey {
  user_name = "user_name",
  user_position = "user_position",
}

class Storage implements StorageInterface {
  private storage: globalThis.Storage;
  private prefix: string;

  constructor(type: "local" | "session" = "local", prefix: string = "app_") {
    this.storage =
      type === "local" ? window.localStorage : window.sessionStorage;
    this.prefix = prefix;
  }

  /**
   * 获取完整的键名
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * 获取存储的值
   */
  get<T>(key: string): T | null {
    const value = this.storage.getItem(this.getKey(key));
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    }
    return null;
  }

  /**
   * 设置存储的值
   */
  set<T>(key: string, value: T): void {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    this.storage.setItem(this.getKey(key), stringValue);
  }

  /**
   * 删除指定键的值
   */
  remove(key: string): void {
    this.storage.removeItem(this.getKey(key));
  }

  /**
   * 清空所有带前缀的存储
   */
  clear(): void {
    const keys = Object.keys(this.storage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key);
      }
    });
  }
}

// 创建默认实例
export const localStorage = new Storage("local");
export const sessionStorage = new Storage("session");

// 默认导出本地存储实例
export default localStorage;
