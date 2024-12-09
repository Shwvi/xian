import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";
import { getXianCore } from "./core/core";
import { initializeNavigation } from "@/utils/navigation";
import { sleep } from "./utils/sleep";

const Home = lazy(() => import("./pages/Home"));
const Battle = lazy(() => import("./pages/battle"));
const Scene = lazy(() => import("./pages/Scene"));
const Start = lazy(() => import("./pages/Start"));

function InnerApp() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    initializeNavigation(navigate);
    sleep(3000).then(() => {
      getXianCore().awesomeStart();
      setIsLoading(false);
    });
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {!isLoading && (
          <>
            <Route path="/battle" element={<Battle />} />
            <Route path="/scene" element={<Scene />} />
            <Route path="/start" element={<Start />} />
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
