import { lazyGetInstance } from "@/utils/lazyGetInstanceSigleTon";
import {
  EventStream,
  filterEvent,
  getCoreStream,
  IEvent,
  StageEvent,
  StreamBasedSystem,
} from "./stream";
import { userSystem, UserSystem } from "./user";
import { SceneManager, sceneManager } from "./scene/SceneManager";
import { navigateTo } from "@/utils/navigation";
import { filter, map, pairwise, scan } from "rxjs";

export class XianCore extends StreamBasedSystem {
  private userSystem: UserSystem;
  private sceneSystem: SceneManager;

  constructor(eventStream: EventStream<IEvent>) {
    super(eventStream);

    this.userSystem = userSystem;
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
    this.addSubscription(
      this.sceneSystem.isMoving.wrapper
        .getObservable()
        .pipe(
          // 记录每个状态的时间
          map((isMoving) => ({ isMoving, timestamp: Date.now() })),
          // 找到第一个 true 的时间点
          scan(
            (acc, curr) => {
              if (curr.isMoving && acc.startTime === null) {
                // 记录第一个 true 的时间
                return { startTime: curr.timestamp, isMoving: curr.isMoving };
              }
              if (!curr.isMoving && acc.startTime !== null) {
                // 遇到 false 时，计算时间差
                const duration = curr.timestamp - acc.startTime;
                return { startTime: null, isMoving: curr.isMoving, duration };
              }
              return { ...acc, isMoving: curr.isMoving };
            },
            { startTime: null as number | null, isMoving: false }
          ),
          // 只输出有 duration 的结果
          filter((state) => "duration" in state),
          map((state) => state.duration)
        )
        .subscribe((duration) => {
          console.log(`Moving duration: ${duration}ms`);
        })
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
