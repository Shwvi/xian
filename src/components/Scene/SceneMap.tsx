import { useEffect, useRef } from "react";
import { IScene } from "@/core/typing";

interface Props {
  scenes: IScene[];
  currentScene: IScene | null;
  onSceneClick?: (scene: IScene) => void;
}

export default function SceneMap({
  scenes,
  currentScene,
  onSceneClick,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制场景连接线
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    scenes.forEach((scene) => {
      scene.neighbors.forEach((neighborId) => {
        const neighbor = scenes.find((s) => s.id === neighborId);
        if (neighbor) {
          ctx.beginPath();
          ctx.moveTo(scene.position.x, scene.position.y);
          ctx.lineTo(neighbor.position.x, neighbor.position.y);
          ctx.stroke();
        }
      });
    });

    // 绘制场景点
    scenes.forEach((scene) => {
      ctx.beginPath();
      ctx.fillStyle =
        scene.id === currentScene?.id ? "#ffd700" : "rgba(255,255,255,0.5)";
      ctx.arc(scene.position.x, scene.position.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // 场景名称
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(scene.name, scene.position.x, scene.position.y - 15);
    });
  }, [scenes, currentScene]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSceneClick) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检测点击是否在某个场景范围内
    const clickedScene = scenes.find((scene) => {
      const dx = x - scene.position.x;
      const dy = y - scene.position.y;
      return Math.sqrt(dx * dx + dy * dy) < 10;
    });

    if (clickedScene) {
      onSceneClick(clickedScene);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      onClick={handleClick}
      className="w-full h-full"
    />
  );
}
