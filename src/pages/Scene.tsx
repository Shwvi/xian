import Loading from "@/components/loading";
import WorldMap from "@/components/Scene/WorldMap";
import { sceneManager } from "@/core/scene/SceneManager";
import { userSystem } from "@/core/user";
import { useObservable } from "@/lib/observable";
import { cultivationLevelToText } from "@/utils/toText";
import { useMemo, useState } from "react";
import SceneMap from "@/components/Scene/SceneMap";
import { WorldAction } from "@/components/Scene/WorldAction";
import { getWorldData } from "@/data/world";

const WorldPanel = () => {
  const currentWorldId = useObservable(sceneManager.currentWorldId);
  const nearWorlds = useObservable(sceneManager.nearWorlds);
  const isMoving = useObservable(sceneManager.isMoving);
  const detail = useMemo(() => {
    if (isMoving) {
      return <Loading className="animate-pulse flex-row" text="移动中..." />;
    }

    if (nearWorlds.length > 0) {
      return (
        <div className="flex gap-2 text-sm w-full">
          <div>附近</div>
          <div className="flex-1 overflow-x-auto">
            {nearWorlds.map((world) => (
              <WorldAction key={world.id} world={world}>
                <span className="text-gray-400 animate-fade-in">
                  {world.name}
                </span>
              </WorldAction>
            ))}
          </div>
        </div>
      );
    }

    return null;
  }, [isMoving, nearWorlds]);

  const currentWorld = useMemo(() => {
    if (!currentWorldId) return null;
    return getWorldData(currentWorldId);
  }, [currentWorldId]);

  return (
    <div className="bg-gray-800/60 rounded-lg p-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="text-lg text-white">{currentWorld?.name}</div>
          <div className="text-gray-400 text-sm">
            {currentWorld?.description}
          </div>
        </div>

        <div className="h-16 overflow-auto flex items-center justify-center">
          {detail}
        </div>
      </div>
    </div>
  );
};

const Scene = () => {
  const user = useObservable(userSystem.user$);
  return (
    <div className="h-full w-full flex flex-col gap-2">
      <div className="flex-1 w-full overflow-hidden rounded-md">
        <WorldMap />
      </div>

      <WorldPanel />

      <div className="bg-gray-800/60 rounded-lg p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-gray-200 font-medium whitespace-nowrap">
              {user?.name}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatusItem label="年龄" value={user?.age} />
            <StatusItem
              label="境界"
              value={cultivationLevelToText(user!.cultivation_level)}
            />
          </div>
        </div>
      </div>

      <div className="h-10 backdrop-blur overflow-auto flex items-center gap-1">
        {["内视", "背包", "技能", "任务", "设置"].map((item) => (
          <button key={item} className="flex-1 text-gray-400 whitespace-nowrap">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

const StatusItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) => (
  <div className="flex items-center gap-1">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="text-gray-200">{value}</span>
  </div>
);

export default Scene;
