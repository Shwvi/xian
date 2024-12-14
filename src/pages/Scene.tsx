import Loading from "@/components/loading";
import WorldMap from "@/components/Scene/WorldMap";
import { sceneManager } from "@/core/scene/SceneManager";
import { ILandmark, IScene, ISceneAction } from "@/core/typing";
import { userSystem } from "@/core/user";
import { useObservable } from "@/lib/observable";
import { cultivationLevelToText } from "@/utils/toText";
import { useState } from "react";
import SceneMap from "@/components/Scene/SceneMap";

const Scene = () => {
  const currentLandmark = useObservable(sceneManager.currentLandmark);
  const currentScene = useObservable(sceneManager.currentScene);
  const user = useObservable(userSystem.user$);
  return (
    <div className="h-full w-full flex flex-col gap-2">
      <div className="flex-1 w-full overflow-hidden rounded-md">
        {currentLandmark && currentScene ? (
          <div className="h-full bg-gray-800/60 rounded-lg">
            <SceneMap
              scenes={currentLandmark.scenes}
              currentScene={currentScene}
              onSceneClick={(clickedScene) => {
                if (clickedScene.id !== currentScene?.id) {
                  sceneManager.toScene(clickedScene.id);
                }
              }}
            />
          </div>
        ) : (
          <WorldMap />
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-gray-900/50 backdrop-blur rounded-md">
        <div className="flex-1 overflow-y-auto p-4">
          {currentLandmark && currentScene ? (
            <SceneContent
              landmark={currentLandmark}
              scene={currentScene}
              onBack={() => sceneManager.exitLandmark()}
            />
          ) : (
            <RegionContent />
          )}
        </div>
      </div>

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

const RegionContent = () => {
  const region = useObservable(sceneManager.currentRegion);
  const nearingLandmarks = useObservable(sceneManager.nearingLandmarks);
  const [previewLandmark, setPreviewLandmark] = useState<ILandmark | null>(
    null
  );

  const isMoving = useObservable(sceneManager.isMoving);

  if (!region) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-200">{region?.name}</h2>
        <p className="text-sm text-gray-400 mt-1">{region?.description}</p>
      </div>

      <div className="flex-1">
        {previewLandmark ? (
          <div className="p-4 bg-gray-800/60 backdrop-blur rounded-md">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-200">
                {previewLandmark.name}
              </h3>
            </div>

            <div className="text-gray-300 text-sm text-justify">
              {previewLandmark.description}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setPreviewLandmark(null)}
                className="w-full py-3 text-white rounded-lg font-medium"
              >
                离开
              </button>

              <button
                onClick={() => sceneManager.enterLandmark(previewLandmark.id)}
                className="w-full py-3 text-white rounded-lg font-medium"
              >
                进入
              </button>
            </div>
          </div>
        ) : isMoving ? (
          <div className="flex justify-center items-center h-full animate-pulse">
            <Loading text="正在移动中..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {nearingLandmarks.map((landmark) => (
              <button
                key={landmark.id}
                onClick={() => setPreviewLandmark(landmark)}
                className="flex items-center p-4 bg-gray-800/60 rounded-lg text-left transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-200">
                    {landmark.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {getLandmarkTypeText(landmark.type)}
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getLandmarkTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    sect: "修仙门派",
    city: "城镇",
    dungeon: "秘境",
    default: "野外",
  };
  return typeMap[type] || typeMap.default;
};

function SceneContent({
  landmark,
  scene,
  onBack,
}: {
  landmark: ILandmark;
  scene: IScene | null;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-none">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-200"
          >
            ← 返回
          </button>
          <h2 className="text-2xl font-bold text-gray-200">
            {scene?.name || landmark.name}
          </h2>
        </div>
      </div>

      <div className="flex-1 gap-4">
        <div className="space-y-4">
          <div className="text-gray-300">
            {scene?.description || landmark.description}
          </div>

          {scene && (
            <div className="space-y-2">
              {scene.actions.map((action, index) => (
                <button
                  key={index}
                  className="block w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded"
                  onClick={() => sceneManager.handleAction(action)}
                >
                  {action.description}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
