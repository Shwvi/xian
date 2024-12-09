import { navigateTo } from "@/utils/navigation";
import {
  EventStream,
  getCoreStream,
  IEvent,
  NormalEvent,
  StreamBasedSystem,
} from "./stream";
import storage from "@/data/persist";

import {
  CharacterSId,
  CultivationLevel,
  IBaseCharacter,
  SkillId,
} from "./typing";
import { lazyGetInstanceSigleTon } from "@/utils/lazyGetInstanceSigleTon";

export class UserSystem extends StreamBasedSystem {
  public initialized = false;
  private user?: IBaseCharacter;

  constructor(eventStream: EventStream<IEvent>) {
    super(eventStream);
  }

  public async initialize() {
    navigateTo("/start");

    const name =
      storage.get<string>("user_name") ||
      (await this.once(NormalEvent.USER_SET_NAME)).payload;

    storage.set("user_name", name);

    this.user = {
      sid: CharacterSId.ME,
      name,

      age: 20,
      life_span: 100,

      health_points: 200,
      manna_points: 200,

      attack: 15,
      defense: 10,
      agility: 12,

      cultivation_level: CultivationLevel.ZERO,

      skills: [SkillId.WU_LEI_ZHENG_FA, SkillId.YU_JIAN_SHU, SkillId.QUAN],
    };

    this.initialized = true;
  }

  public getUser() {
    if (!this.initialized) {
      throw new Error("UserSystem not initialized");
    }
    return this.user!;
  }
}

export const getUserSystem = lazyGetInstanceSigleTon(
  () => new UserSystem(getCoreStream())
);
