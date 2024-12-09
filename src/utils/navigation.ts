import { NavigateFunction, NavigateOptions } from "react-router-dom";

let navigate: NavigateFunction;

// 初始化導航函數，在 App 組件中調用
export function initializeNavigation(navigationFunction: NavigateFunction) {
  navigate = navigationFunction;
}

// 定義可用的路由路徑
export type RoutePath = string;

// 導航到指定路徑
export function navigateTo(path: RoutePath, options?: NavigateOptions) {
  if (!navigate) {
    console.warn("Navigation function not initialized");
    return;
  }
  navigate(path, options);
}
