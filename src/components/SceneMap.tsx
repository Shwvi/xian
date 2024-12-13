import { useEffect, useRef, useState } from "react";
import { IWorldMap } from "@/core/typing";
import { SceneMapRenderer } from "@/core/renderer/SceneMapRenderer";
import { getSceneManager } from "@/core/scene";
import { filterEvent, NormalEvent } from "@/core/stream";
import { use } from "@/lib/hooks/use";

export default function SceneMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<SceneMapRenderer | null>(null);

  const sceneManager = getSceneManager();
  const position = use(sceneManager.position$);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize renderer
    rendererRef.current = new SceneMapRenderer(containerRef.current);
    rendererRef.current.render(
      sceneManager.getWorldMap(),
      position,
      sceneManager.movePlayer.bind(sceneManager)
    );

    return () => {
      rendererRef.current?.destroy();
    };
  }, [position, sceneManager, sceneManager.movePlayer]);

  return <div ref={containerRef} className="w-full h-full" />;
}
