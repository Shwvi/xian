import { navigateTo } from "@/utils/navigation";
import {
  EventStream,
  getCoreStream,
  IEvent,
  NormalEvent,
  StreamBasedSystem,
} from "./stream";
import storage, { StorageKey } from "@/data/persist";

import {
  CharacterSId,
  CultivationLevel,
  IBaseCharacter,
  SkillId,
} from "./typing";
import {
  lazyGetInstance,
  lazyGetInstanceSigleTon,
} from "@/utils/lazyGetInstanceSigleTon";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Point } from "./map-canvas";
import { createObservable, createPresistentObservable } from "@/lib/observable";
import _ from "lodash";

export interface IUser extends IBaseCharacter {
  position: Point;
}

export class UserSystem extends StreamBasedSystem {
  public initialized = false;
  public user$ = createPresistentObservable<IUser | null>(null, {
    key: StorageKey.user_core,
  });

  constructor(eventStream: EventStream<IEvent>) {
    super(eventStream);
  }

  public async initialize() {
    if (!this.user$.get()) {
      navigateTo("/start");
      const name = (await this.once(NormalEvent.USER_SET_NAME)).payload;

      this.user$.set({
        sid: CharacterSId.ME,
        name,

        age: 20,
        life_span: 100,

        health_points: 100,
        manna_points: 60,

        attack: 15,
        defense: 10,
        agility: 12,

        cultivation_level: CultivationLevel.ZERO,

        skills: [SkillId.WU_LEI_ZHENG_FA, SkillId.YU_JIAN_SHU, SkillId.QUAN],

        position: { x: 0, y: 0 },
      });
    }

    this.initialized = true;
  }

  public updateUserPosition(pos: IUser["position"]) {
    this.user$.update((user) => {
      if (!user) return user;
      user.position = pos;
      return user;
    });
  }
}

export const userSystem = lazyGetInstance(
  () => new UserSystem(getCoreStream())
);
