import { lazyGetInstanceSigleTon } from "@/utils/lazyGetInstanceSigleTon";
import {
  BattleEvent,
  eventProvider,
  EventStream,
  filterEvent,
  getCoreStream,
  IEvent,
  NormalEvent,
  RequestEvent,
  StageEvent,
  StreamBasedSystem,
} from "../stream";
import {
  CharacterSId,
  IScene,
  ISceneState,
  SceneId,
  IScenePosition,
  IWorldMap,
  IMapRegion,
  TerrainType,
} from "../typing";
import { navigateTo } from "@/utils/navigation";
import { getScenesCenter } from "@/data/scenes";
import { getUserSystem } from "@/core/user";
import { mockWorldMap } from "@/data/worldMap";
import { generateUniqId } from "@/utils/uid";

export class SceneManager extends StreamBasedSystem {
  private worldMap!: IWorldMap;
  public position$ = this.state$("position", { x: 0, y: 0 });
  public isMoving$ = this.state$("isMoving", false);

  constructor(eventStream: EventStream<IEvent>) {
    super(eventStream);
  }

  public initialize() {
    // Initialize all scenes
    // 初始化世界地图
    this.worldMap = mockWorldMap;

    // 设置初始位置为铁剑山门
    this.position$.next({
      x: 0,
      y: 0,
    });

    navigateTo("/scene");
  }

  private calculateDistance(
    pos1: IScenePosition,
    pos2: IScenePosition
  ): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private updatePlayerPosition(x: number, y: number) {
    this.position$.next({ x, y });
  }

  public async movePlayer(x: number, y: number) {
    if (this.isMoving$.value) return;

    this.isMoving$.next(true);
    try {
      // 生成路途中的随机事件点
      const distance = this.calculateDistance(this.position$.value, { x, y });
      const eventCount = Math.floor(distance / 100); // 每100单位距离可能产生一个事件

      const movementEvents = Array(eventCount)
        .fill(null)
        .map(() => ({
          position: {
            x:
              this.position$.value.x +
              Math.random() * (x - this.position$.value.x),
            y:
              this.position$.value.y +
              Math.random() * (y - this.position$.value.y),
          },
          event: "random_event",
        }));

      // 检查路途中的事件

      // 更新最终位置
      this.updatePlayerPosition(x, y);
    } finally {
      this.isMoving$.next(false);
    }
  }

  private canEnterRegion(region: IMapRegion): boolean {
    const user = getUserSystem().getUser();
    return user.cultivation_level >= region.requiredLevel;
  }

  private calculateLifeCost(
    distance: number,
    fromRegion: IMapRegion | null,
    toRegion: IMapRegion
  ): number {
    let baseCost = Math.ceil(distance / 100);

    // 不同地形的消耗倍率
    const terrainMultiplier = {
      [TerrainType.PLAIN]: 1,
      [TerrainType.MOUNTAIN]: 2,
      [TerrainType.FOREST]: 1.5,
      [TerrainType.DESERT]: 2.5,
      [TerrainType.WATER]: 3,
      [TerrainType.SACRED]: 1,
      [TerrainType.FORBIDDEN]: 4,
    };

    // 考虑目标地形的消耗倍率
    baseCost *= terrainMultiplier[toRegion.terrain];

    // 考虑危险等级带来的额外消耗
    baseCost *= 1 + toRegion.dangerLevel * 0.2;

    return Math.ceil(baseCost);
  }

  private checkRandomEvents(region: IMapRegion) {
    if (!region.specialEvents?.length) return;

    // 根据地区危险等级调整事件触发概率
    const eventChance = 0.1 + region.dangerLevel * 0.05;

    if (Math.random() < eventChance) {
      const event =
        region.specialEvents[
          Math.floor(Math.random() * region.specialEvents.length)
        ];

      // this.$.publish({
      //   type: BattleEvent.SPECIAL_EVENT,
      //   payload: {
      //     eventId: event,
      //     region: region.name,
      //   },
      // });
    }
  }

  // 添加获取地图和玩家位置的方法
  public getWorldMap(): IWorldMap {
    return this.worldMap;
  }

  public getPlayerPosition(): { x: number; y: number } {
    return { ...this.position$.value };
  }

  public getPlayerLevel(): number {
    return getUserSystem().getUser().cultivation_level;
  }
}

export const getSceneManager = lazyGetInstanceSigleTon(() => {
  const sceneManager = new SceneManager(getCoreStream());
  return sceneManager;
});
