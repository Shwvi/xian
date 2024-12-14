import WorldMap from "@/components/Scene/WorldMap";
import { sceneManager } from "@/core/scene/SceneManager";
import { ILandmark, IScene, ISceneAction } from "@/core/typing";
import { useObservable } from "@/lib/observable";
import { useState } from "react";

const Scene = () => {
  const currentLandmark = useObservable(sceneManager.currentLandmark);
  const currentScene = useObservable(sceneManager.currentScene);

  return (
    <div className="h-full w-full flex flex-col gap-4">
      {!currentLandmark && (
        <div className="h-1/2 w-full overflow-hidden rounded-md">
          <WorldMap />
        </div>
      )}

      <div className="h-1/2 overflow-hidden flex-1 p-4 bg-gray-900/50 backdrop-blur rounded-md">
        {currentLandmark && currentScene ? (
          <SceneContent
            landmark={currentLandmark}
            scene={currentScene}
            onBack={() => {
              sceneManager.exitLandmark();
            }}
          />
        ) : (
          <RegionContent />
        )}
      </div>
    </div>
  );
};

const RegionContent = () => {
  const region = useObservable(sceneManager.currentRegion);

  const [previewLandmark, setPreviewLandmark] = useState<ILandmark | null>(
    null
  );

  if (!region) return null;

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold text-gray-200 mb-4">{region.name}</h2>
      <div className="text-gray-300 mb-6">{region.description}</div>

      <div className="overflow-auto">
        {previewLandmark ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-200">
                {previewLandmark.name}
              </h3>
              <button
                onClick={() => setPreviewLandmark(null)}
                className="text-gray-400 hover:text-gray-200"
              >
                返回
              </button>
            </div>
            <div className="text-gray-300">{previewLandmark.description}</div>
            <button
              onClick={() => {
                sceneManager.enterLandmark(previewLandmark.id);
              }}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              进入{previewLandmark.name}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {region.landmarks.map((landmark) => (
              <button
                key={landmark.id}
                onClick={() => {
                  setPreviewLandmark(landmark);
                }}
                className="p-4 bg-gray-800 hover:bg-gray-700 rounded text-left"
              >
                <div className="font-bold text-gray-200">{landmark.name}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {landmark.type === "sect"
                    ? "修仙门派"
                    : landmark.type === "city"
                    ? "城镇"
                    : landmark.type === "dungeon"
                    ? "秘境"
                    : "野外"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
    <div>
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-200">
          ← 返回
        </button>
        <h2 className="text-2xl font-bold text-gray-200">
          {scene?.name || landmark.name}
        </h2>
      </div>

      <div className="text-gray-300 mb-6">
        {scene?.description || landmark.description}
      </div>

      {scene && (
        <div className="space-y-2">
          {scene.actions.map((action, index) => (
            <button
              key={index}
              className="block w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded"
              onClick={() => handleAction(action)}
            >
              {action.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function handleAction(action: ISceneAction) {
  switch (action.type) {
    case "move":
      if (action.data.targetSceneId) {
        sceneManager.toScene(action.data.targetSceneId);
      }
      break;
    // 处理其他类型的动作...
  }
}

export default Scene;
