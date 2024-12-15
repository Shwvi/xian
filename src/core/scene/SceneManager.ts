import { IWorldData, ISceneAction, IWorldAction } from "../typing";
import { getWorldData, worldData } from "@/data/world";
import { createObservable, createPresistentObservable } from "@/lib/observable";
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
import { StorageKey } from "@/data/persist";

export class SceneManager extends StreamBasedSystem {
  public currentWorldId = createPresistentObservable<IWorldData["id"] | null>(
    null,
    {
      key: StorageKey.current_world,
    }
  );
  public nearWorlds = createObservable<IWorldData[]>([]);

  // 地图状态
  public data: IWorldData[] = worldData;
  public isMoving = createObservable<boolean>(false);

  constructor(eventStream: EventStream<IEvent>) {
    super(eventStream);
  }

  public initialize() {
    // 初始化为第一个区域
    if (!this.currentWorldId.get()) {
      this.currentWorldId.set("eastern_realm");
    }

    navigateTo("/scene");
  }

  public async handleAction(action: IWorldAction) {
    console.log(action);
    switch (action.type) {
      case "move": {
        this.currentWorldId.set(action.target);
        break;
      }
      case "character": {
        const stateId = generateUniqId();
        this.$.publish({
          type: StageEvent.STAGE_SWITCH,
          payload: {
            stateId,
            path: "/battle",
          },
        });
        await eventProvider.provideCurrentBattle(stateId, {
          enemies: [action.character],
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
