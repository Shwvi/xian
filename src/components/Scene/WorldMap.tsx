import { useEffect, useRef, useState } from "react";
import { sceneManager } from "@/core/scene/SceneManager";
import { IRegion, ILandmark } from "@/core/typing";
import { useObservable } from "@/lib/observable";
import { MapManager } from "@/core/scene/MapManager";

export default function WorldMap() {
  const mapManager = useRef<MapManager | null>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      mapManager.current = new MapManager(container.current, sceneManager);

      return () => {
        mapManager.current?.destroy();
      };
    }
  }, []);

  return <div ref={container} className="w-full h-full bg-slate-500"></div>;
}
