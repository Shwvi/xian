import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IMapRegion, IScene } from "@/core/typing";
import {
  BattleEvent,
  filterEvent,
  getCoreStream,
  NormalEvent,
} from "@/core/stream";
import { getSceneManager, SceneManager } from "@/core/scene";
import SceneMap from "@/components/SceneMap";
import { getUserSystem } from "@/core/user";

const RegionInfo = ({ region }: { region: IMapRegion }) => (
  <div className="bg-gray-800/90 p-4 rounded-lg">
    <h3 className="text-lg font-bold text-gray-200">{region.name}</h3>
    <p className="text-sm text-gray-400 mt-2">{region.description}</p>
    <div className="mt-4 space-y-2">
      <div className="text-sm">
        <span className="text-gray-400">地形类型：</span>
        <span className="text-gray-200">{region.terrain}</span>
      </div>
      <div className="text-sm">
        <span className="text-gray-400">危险等级：</span>
        <span className="text-gray-200">{"⚠️".repeat(region.dangerLevel)}</span>
      </div>
      <div className="text-sm">
        <span className="text-gray-400">可采集资源：</span>
        <div className="flex gap-2 mt-1">
          {region.resources.map((resource, index) => (
            <span key={index} className="px-2 py-1 bg-gray-700 rounded text-xs">
              {resource}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function Scene() {
  const [movementStatus, setMovementStatus] = useState<{
    isMoving: boolean;
    currentEvent?: any;
  }>({ isMoving: false });

  return (
    <div className="h-full w-full flex flex-col gap-4">
      <SceneMap />

      {movementStatus.currentEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h3>遭遇事件！</h3>
            <p>{movementStatus.currentEvent.description}</p>
            <button onClick={() => setMovementStatus({ isMoving: true })}>
              继续前进
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
