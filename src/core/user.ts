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
import { createObservable } from "@/lib/observable";
import _ from "lodash";

export interface IUser extends IBaseCharacter {
  position: Point;
}

export class UserSystem extends StreamBasedSystem {
  public initialized = false;
  public user$ = createObservable<IUser | null>(null);

  constructor(eventStream: EventStream<IEvent>) {
    super(eventStream);

    this.saveLocalPosition = _.debounce(this.saveLocalPosition.bind(this), 300);
  }

  private async getUserName() {
    let name = storage.get<string>(StorageKey.user_name);
    if (!name) {
      navigateTo("/start");
      name = (await this.once(NormalEvent.USER_SET_NAME)).payload;
      storage.set(StorageKey.user_name, name);
    }
    return name;
  }

  public async initialize() {
    const name = await this.getUserName();

    const localPosition = this.getLocalPosition();

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

      position: localPosition ?? { x: 0, y: 0 },
    });

    this.initialized = true;
  }

  private getLocalPosition() {
    const position = storage.get<IUser["position"]>(StorageKey.user_position);
    return position;
  }

  public updateUserPosition(pos: IUser["position"]) {
    this.user$.update((user) => {
      if (!user) return user;
      user.position = pos;
      return user;
    });
    this.saveLocalPosition();
  }

  private saveLocalPosition() {
    storage.set(StorageKey.user_position, this.user$.get()!.position);
  }
}

export const userSystem = lazyGetInstance(
  () => new UserSystem(getCoreStream())
);
