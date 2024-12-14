import { IRegion, ILandmark, IScene, IWorldData } from "../typing";
import { worldData } from "@/data/world";
import { createObservable } from "@/lib/observable";
import { lazyGetInstance } from "@/utils/lazyGetInstanceSigleTon";
import { navigateTo } from "@/utils/navigation";

export class SceneManager {
  public currentRegion = createObservable<IRegion | null>(null);

  public currentLandmark = createObservable<ILandmark | null>(null);

  public currentScene = createObservable<IScene | null>(null);

  public data: IWorldData = worldData;

  constructor() {}

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
}

export const sceneManager = lazyGetInstance(() => new SceneManager());
