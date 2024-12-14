import { useEffect, useRef } from "react";
import { sceneManager } from "@/core/scene/SceneManager";
import { MapManager } from "@/core/scene/MapManager";
import { userSystem } from "@/core/user";

export default function WorldMap() {
  const mapManager = useRef<MapManager | null>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      mapManager.current = new MapManager(
        container.current,
        sceneManager,
        userSystem
      );

      return () => {
        mapManager.current?.destroy();
      };
    }
  }, []);

  return <div ref={container} className="w-full h-full bg-slate-500"></div>;
}
