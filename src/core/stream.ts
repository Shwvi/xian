import { Subject, Observable, OperatorFunction, Subscription } from "rxjs";
import {
  CharacterSId,
  IBattleAbleCharacter,
  IEndBattleContext,
  ISkill,
  ISkillDamageBattleContext,
  ISkillUseBattleContext,
  IStartBattleContext,
} from "./typing";
import { lazyGetInstanceSigleTon } from "@/utils/lazyGetInstanceSigleTon";

export enum NormalEvent {
  USER_SELECT_SKILL = "USER_SELECT_SKILL",
  APPEND_BATTLE_LOG = "APPEND_BATTLE_LOG",
}

export enum BattleEvent {
  BATTLE_START = "BATTLE_START",
  SKILL_USE = "SKILL_USE",
  DAMAGE_DEALT = "DAMAGE_DEALT",
  BATTLE_END = "BATTLE_END",

  REQUEST_CHARACTER_STATE = "REQUEST_CHARACTER_STATE",
  RESPONSE_CHARACTER_STATE = "RESPONSE_CHARACTER_STATE",
}

export type CoreEvent = NormalEvent | BattleEvent;

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
  typeSpeed?: number;
}

// 定义每个事件对应的payload类型
export type EventPayloadMap = {
  [NormalEvent.USER_SELECT_SKILL]: ISkill;
  [NormalEvent.APPEND_BATTLE_LOG]: IAppendBattleLogEvent;

  [BattleEvent.BATTLE_START]: IStartBattleContext;
  [BattleEvent.SKILL_USE]: ISkillUseBattleContext;
  [BattleEvent.DAMAGE_DEALT]: ISkillDamageBattleContext;
  [BattleEvent.BATTLE_END]: IEndBattleContext;

  [BattleEvent.REQUEST_CHARACTER_STATE]: CharacterSId;
  [BattleEvent.RESPONSE_CHARACTER_STATE]: IBattleAbleCharacter;
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
    console.log("new Event", data);
    this.subject.next(data);
  }

  /**
   * 订阅事件
   */
  subscribe(observer: (value: T) => void): () => void {
    const subscription = this.stream$.subscribe(observer);
    return () => subscription.unsubscribe();
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

  public setEventStream(eventStream: EventStream<T>) {
    this.eventStream = eventStream;
  }

  protected addSubscription(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }

  protected once<K extends CoreEvent>(
    type: K
  ): Promise<Extract<T, { type: K }>> {
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

  protected get $() {
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
