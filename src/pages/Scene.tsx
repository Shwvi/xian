import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IScene } from "@/core/typing";
import { BattleEvent, filterEvent, getCoreStream } from "@/core/stream";
import { getSceneManager, SceneManager } from "@/core/scene";

export default function Scene() {
  const navigate = useNavigate();
  const [scene, setScene] = useState<IScene | null>(null);

  const [lastBattleResult, setLastBattleResult] = useState<{
    won: boolean;
    enemyId: number;
  } | null>(null);

  useEffect(() => {
    const sceneManager = getSceneManager();

    // 初始化场景
    setScene(sceneManager.getCurrentScene());

    // 监听场景变化
    sceneManager.$.pipe(filterEvent(BattleEvent.SCENE_UPDATE)).subscribe(
      ({ payload: { scene } }) => {
        setScene(scene);
      }
    );
  }, []);

  if (!scene) return null;

  return (
    <div className="h-full w-full p-4">
      <h1 className="text-2xl text-gray-200 mb-4">{scene.name}</h1>

      <p className="text-gray-300 mb-6">{scene.description}</p>

      {lastBattleResult && (
        <div
          className={`mb-6 p-4 rounded ${
            lastBattleResult.won ? "bg-green-900/20" : "bg-red-900/20"
          }`}
        >
          <p className="text-gray-200">
            {lastBattleResult.won ? "你赢得了战斗！" : "你在战斗中失败了..."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {scene.actions.map((action, index) => (
          <button
            key={index}
            className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded text-left"
            onClick={() => getSceneManager()?.performAction(index)}
          >
            {action.description}
          </button>
        ))}
      </div>
    </div>
  );
}
