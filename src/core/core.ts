import { lazyGetInstance } from "@/utils/lazyGetInstanceSigleTon";
import {
  EventStream,
  filterEvent,
  getCoreStream,
  IEvent,
  StageEvent,
  StreamBasedSystem,
} from "./stream";
import { getUserSystem, UserSystem } from "./user";
import { SceneManager, sceneManager } from "./scene/SceneManager";
import { navigateTo } from "@/utils/navigation";

export class XianCore extends StreamBasedSystem {
  private userSystem: UserSystem;
  private sceneSystem: SceneManager;

  constructor(eventStream: EventStream<IEvent>) {
    super(eventStream);

    this.userSystem = getUserSystem();
    this.sceneSystem = sceneManager;
  }

  private async initialize() {
    // global listener
    this.addSubscription(
      this.$.pipe(filterEvent(StageEvent.STAGE_SWITCH)).subscribe(
        ({ payload }) => {
          const { path, stateId } = payload;
          navigateTo(`${path}?stateId=${stateId}`);
        }
      )
    );
  }

  public async awesomeStart(callback?: () => void) {
    await this.initialize();
    callback?.();
    await this.userSystem.initialize();
    await this.sceneSystem.initialize();
  }
}

export const xianCore = lazyGetInstance(() => {
  const core = new XianCore(getCoreStream());
  return core;
});
