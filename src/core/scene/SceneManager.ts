import {
  IRegion,
  ILandmark,
  IScene,
  IWorldData,
  ISceneAction,
} from "../typing";
import { worldData } from "@/data/world";
import { createObservable } from "@/lib/observable";
import { lazyGetInstance } from "@/utils/lazyGetInstanceSigleTon";
import { navigateTo } from "@/utils/navigation";
import {
  eventProvider,
  EventStream,
  getCoreStream,
  IEvent,
  StageEvent,
  StreamBasedSystem,
} from "../stream";
import { generateUniqId } from "@/utils/uid";

export class SceneManager extends StreamBasedSystem {
  public currentRegion = createObservable<IRegion | null>(null);

  public currentLandmark = createObservable<ILandmark | null>(null);
  public nearingLandmarks = createObservable<ILandmark[]>([]);

  public currentScene = createObservable<IScene | null>(null);

  // 地图状态
  public data: IWorldData = worldData;
  public isMoving = createObservable<boolean>(false);

  constructor(eventStream: EventStream<IEvent>) {
    super(eventStream);
  }

  public initialize() {
    // 初始化为第一个区域
    this.currentRegion.set(this.data.regions[0]);
    this.currentLandmark.set(null);
    this.currentScene.set(null);

    navigateTo("/scene");
  }

  public toScene(sceneId: string | null) {
    const currentLandmark = this.currentLandmark.get();
    if (!currentLandmark) throw new Error("No current landmark");

    const scene = currentLandmark.scenes.find((s) => s.id === sceneId);

    this.currentScene.set(scene ?? null);
  }

  public enterLandmark(landmarkId: string) {
    const landmark = this.currentRegion
      .get()
      ?.landmarks.find((l) => l.id === landmarkId);

    if (landmark) {
      this.currentLandmark.set(landmark);

      if (landmark.scenes.length > 0) {
        // 默认进入第一个场景
        this.toScene(landmark.scenes[0].id ?? null);
      }
    }
  }

  public exitLandmark() {
    this.currentLandmark.set(null);
    this.currentScene.set(null);
  }

  public updateNearLandmarks(landmarkIds: Pick<ILandmark, "id">[]) {
    const landmarks = landmarkIds.map((id) =>
      this.currentRegion.get()!.landmarks.find((l) => l.id === id.id)
    );
    this.nearingLandmarks.set(landmarks.filter((l) => l !== undefined));
  }

  public async handleAction(action: ISceneAction) {
    switch (action.type) {
      case "move":
        if (action.data.targetSceneId) {
          sceneManager.toScene(action.data.targetSceneId);
        }
        break;
      case "battle": {
        const stateId = generateUniqId();
        this.$.publish({
          type: StageEvent.STAGE_SWITCH,
          payload: {
            stateId,
            path: "/battle",
          },
        });
        await eventProvider.provideCurrentBattle(stateId, {
          enemies: action.data.enemies!,
        });
        break;
      }
      // 处理其他类型的动作...
    }
  }
}

export const sceneManager = lazyGetInstance(
  () => new SceneManager(getCoreStream())
);
