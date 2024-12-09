import { lazyGetInstanceSigleTon } from "@/utils/lazyGetInstanceSigleTon";
import {
  BattleEvent,
  EventStream,
  filterEvent,
  getCoreStream,
  IEvent,
  StageEvent,
  StreamBasedSystem,
} from "./stream";
import { getUserSystem, UserSystem } from "./user";
import { getSceneManager, SceneManager } from "./scene";
import { navigateTo } from "@/utils/navigation";
import { CharacterSId } from "./typing";

export class XianCore extends StreamBasedSystem {
  private userSystem: UserSystem;
  private sceneSystem: SceneManager;

  constructor(eventStream: EventStream<IEvent>) {
    super(eventStream);

    this.userSystem = getUserSystem();
    this.sceneSystem = getSceneManager();
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

  public async awesomeStart() {
    await this.initialize();
    await this.userSystem.initialize();
    await this.sceneSystem.initialize();
  }
}

export const getXianCore = lazyGetInstanceSigleTon(() => {
  const core = new XianCore(getCoreStream());
  return core;
});
