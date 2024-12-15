import { useEffect, useRef } from "react";
import { sceneManager } from "@/core/scene/SceneManager";
import { MapManager } from "@/core/scene/MapManager";
import { userSystem } from "@/core/user";
import { useObservable } from "@/lib/observable";
import { getWorldData } from "@/data/world";

export default function WorldMap() {
  const mapManager = useRef<MapManager | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const currentWorldId = useObservable(sceneManager.currentWorldId);

  useEffect(() => {
    if (container.current && currentWorldId) {
      const currentWorld = getWorldData(currentWorldId);

      if (!currentWorld) return;

      mapManager.current = new MapManager(
        container.current,
        currentWorld,
        userSystem,
        sceneManager
      );

      return () => {
        mapManager.current?.destroy();
      };
    }
  }, [currentWorldId]);

  return <div ref={container} className="w-full h-full bg-slate-500"></div>;
}
