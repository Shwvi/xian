import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";
import { xianCore } from "./core/core";
import { initializeNavigation } from "@/utils/navigation";
import { sleep } from "./utils/sleep";
import { sceneManager } from "./core/scene/SceneManager";

const Home = lazy(() => import("./pages/Home"));
const Battle = lazy(() => import("./pages/battle"));
const Scene = lazy(() => import("./pages/Scene"));
const Start = lazy(() => import("./pages/Start"));
const Death = lazy(() => import("./pages/Death"));

function InnerApp() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    initializeNavigation(navigate);
  }, [navigate]);

  useEffect(() => {
    xianCore.awesomeStart(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <Suspense
      fallback={
        <div className=" flex justify-center items-center flex-col gap-2">
          <img className="w-8 invert animate-spin" src="/weapon.png" />
          世界准备中...
        </div>
      }
    >
      <Routes>
        {!isLoading && (
          <>
            <Route path="/battle" element={<Battle />} />
            <Route path="/scene" element={<Scene />} />
            <Route path="/start" element={<Start />} />
            <Route path="/death" element={<Death />} />
          </>
        )}
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  );
}

export default App;
