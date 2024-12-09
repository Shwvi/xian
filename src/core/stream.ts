import { Subject, Observable, OperatorFunction, Subscription } from "rxjs";
import {
  CharacterSId,
  IBattleAbleCharacter,
  IBattleTimeControl,
  IEndBattleContext,
  IScene,
  ISceneAction,
  ISceneState,
  ISkill,
  ISkillDamageBattleContext,
  ISkillUseBattleContext,
  IStartBattleContext,
} from "./typing";
import { lazyGetInstanceSigleTon } from "@/utils/lazyGetInstanceSigleTon";

export enum NormalEvent {
  USER_SELECT_SKILL = "USER_SELECT_SKILL",
  APPEND_BATTLE_LOG = "APPEND_BATTLE_LOG",

  USER_SET_NAME = "USER_SET_NAME",
}

export enum StageEvent {
  STAGE_SWITCH = "STAGE_SWITCH",
}

export enum BattleEvent {
  BATTLE_START = "BATTLE_START",
  SKILL_USE = "SKILL_USE",
  SKILL_USE_DESC_END = "SKILL_USE_DESC_END",

  DAMAGE_DEALT = "DAMAGE_DEALT",
  DAMAGE_DEALT_DESC_END = "DAMAGE_DEALT_DESC_END",

  BATTLE_END = "BATTLE_END",
  BATTLE_END_DESC_END = "BATTLE_END_DESC_END",
  BATTLE_END_RESULT = "BATTLE_END_RESULT",

  NEXT_CHARACTER_TO_ACT = "NEXT_CHARACTER_TO_ACT",

  REQUEST_CHARACTER_STATE = "REQUEST_CHARACTER_STATE",
  RESPONSE_CHARACTER_STATE = "RESPONSE_CHARACTER_STATE",

  TIMELINE_UPDATE = "TIMELINE_UPDATE",

  SCENE_UPDATE = "SCENE_UPDATE",
}

export enum RequestEvent {
  REQUEST_CURRENT_BATTLE = "REQUEST_CURRENT_BATTLE",
  RESPONSE_CURRENT_BATTLE = "RESPONSE_CURRENT_BATTLE",
}

export type CoreEvent = NormalEvent | BattleEvent | StageEvent | RequestEvent;

export interface IBaseEvent {
  type: CoreEvent;
}

export enum LogType {
  GAP = "GAP",

  NORMAL = "NORMAL",
}

export interface IAppendBattleLogEvent {
  type: LogType;
  content: string;
  newParagraph?: boolean;
  buffer?: boolean;
  joinOperator?: string;
}

// 定义每个事件对应的payload类型
export type EventPayloadMap = {
  [NormalEvent.USER_SELECT_SKILL]: ISkill;
  [NormalEvent.APPEND_BATTLE_LOG]: IAppendBattleLogEvent;

  [NormalEvent.USER_SET_NAME]: string;

  [BattleEvent.BATTLE_START]: IStartBattleContext;
  [BattleEvent.SKILL_USE]: ISkillUseBattleContext;
  [BattleEvent.SKILL_USE_DESC_END]: never;

  [BattleEvent.DAMAGE_DEALT]: ISkillDamageBattleContext;
  [BattleEvent.DAMAGE_DEALT_DESC_END]: never;

  [BattleEvent.BATTLE_END]: IEndBattleContext;
  [BattleEvent.BATTLE_END_DESC_END]: never;
  [BattleEvent.BATTLE_END_RESULT]: IEndBattleContext;

  [BattleEvent.NEXT_CHARACTER_TO_ACT]: IBattleAbleCharacter | null;

  [BattleEvent.REQUEST_CHARACTER_STATE]: CharacterSId;
  [BattleEvent.RESPONSE_CHARACTER_STATE]: IBattleAbleCharacter;

  [BattleEvent.TIMELINE_UPDATE]: {
    characters: Array<{
      character: IBattleAbleCharacter;
      currentTime: number;
      castingTime?: number;
    }>;
    timeControl: IBattleTimeControl;
  };

  [BattleEvent.SCENE_UPDATE]: {
    scene: IScene;
    state: ISceneState;
  };

  [StageEvent.STAGE_SWITCH]: {
    path: string;
    stateId: string;
  };

  [RequestEvent.REQUEST_CURRENT_BATTLE]: { stateId: string };
  [RequestEvent.RESPONSE_CURRENT_BATTLE]: IStartBattleContext;
};

// 使用映射类型生成最终的IEvent类型
export type IEvent = {
  [K in CoreEvent]: EventPayloadMap[K] extends never
    ? { type: K }
    : { type: K; payload: EventPayloadMap[K] };
}[CoreEvent];

export class EventStream<T extends IEvent = IEvent> {
  private subject: Subject<T>;
  public readonly stream$: Observable<T>;

  constructor() {
    this.subject = new Subject<T>();
    this.stream$ = this.subject.asObservable();
  }

  /**
   * 发布事件
   */
  publish(data: T): void {
    this.subject.next(data);
  }

  /**
   * 订阅事件
   */
  subscribe(observer: (value: T) => void) {
    return this.stream$.subscribe(observer);
  }

  /**
   * 应用操作符
   */
  pipe<R>(...operations: OperatorFunction<T, R>[]): Observable<R> {
    return this.stream$.pipe(...(operations as [OperatorFunction<T, R>]));
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.subject.complete();
  }
}

export class StreamBasedSystem<T extends IEvent = IEvent> {
  private eventStream?: EventStream<T>;
  private subscriptions: Subscription[] = [];

  constructor(eventStream: EventStream<T>) {
    this.eventStream = eventStream;
  }

  public addSubscription(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }

  public once<K extends CoreEvent>(type: K): Promise<Extract<T, { type: K }>> {
    if (!this.eventStream)
      throw new Error("StreamBasedSystem Cannot run without a eventStream!!!");

    return new Promise((resolve) => {
      const subscription = this.eventStream!.pipe(filterEvent(type)).subscribe(
        (event) => {
          resolve(event as Extract<T, { type: K }>);
        }
      );
      this.addSubscription(subscription);
    });
  }

  public get $() {
    if (this.eventStream) return this.eventStream;
    if (!this.eventStream)
      throw new Error("StreamBasedSystem Cannot run without a eventStream!!!");
    return this.eventStream;
  }

  public destroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}

export const filterEvent = <T extends IEvent, K extends T["type"]>(type: K) => {
  return (source: Observable<T>): Observable<Extract<T, { type: K }>> => {
    return new Observable((subscriber) => {
      return source.subscribe({
        next(value) {
          if (value.type === type) {
            subscriber.next(value as Extract<T, { type: K }>);
          }
        },
        error(err) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      });
    });
  };
};

export const getCoreStream = lazyGetInstanceSigleTon(() => new EventStream());

export const eventRequester = {
  async getCurrentBattle(stateId: string) {
    const temp = new StreamBasedSystem(getCoreStream());

    temp.$.publish({
      type: RequestEvent.REQUEST_CURRENT_BATTLE,
      payload: { stateId },
    });

    const result = await temp.once(RequestEvent.RESPONSE_CURRENT_BATTLE);

    temp.destroy();

    return result.payload;
  },
};

export const eventProvider = {
  async provideCurrentBattle(stateId: string, payload: IStartBattleContext) {
    const temp = new StreamBasedSystem(getCoreStream());

    const event = await temp.once(RequestEvent.REQUEST_CURRENT_BATTLE);
    if (event.payload.stateId === stateId) {
      temp.$.publish({
        type: RequestEvent.RESPONSE_CURRENT_BATTLE,
        payload,
      });
      temp.destroy();
    }
  },
};
