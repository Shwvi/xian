import { CharacterSId, IBaseCharacter, SkillId } from "@/core/typing";
import { lazyGetInstanceSigleTon } from "@/utils/lazyGetInstanceSigleTon";

export class BaseCharactersCenter {
  private charactersMap: Map<CharacterSId, IBaseCharacter> = new Map();

  constructor() {
    this.initializeCharacters();
  }

  private initializeCharacters() {
    this.charactersMap.set(CharacterSId.ME, {
      sid: CharacterSId.ME,
      name: "陈尘",
      age: 20,
      life_span: 100,
      health_points: 100,
      manna_points: 80,
      attack: 15,
      defense: 10,
      agility: 12,
      skills: [SkillId.QUAN, SkillId.YU_JIAN_SHU, SkillId.WU_LEI_ZHENG_FA],
    });

    this.charactersMap.set(CharacterSId.TIE_QUAN, {
      sid: CharacterSId.TIE_QUAN,
      name: "铁山门弟子",
      age: 25,
      life_span: 90,
      health_points: 30,
      manna_points: 20,
      attack: 10,
      defense: 5,
      agility: 5,
      skills: [
        SkillId.QUAN,
        SkillId.HUN_YUAN_TIE_QUAN,
        SkillId.JIN_ZHONG_ZHAO,
        SkillId.DA_LI_JIN_GANG_ZHI,
      ],
    });
  }

  public getCharacter(sid: CharacterSId): IBaseCharacter {
    const character = this.charactersMap.get(sid);
    if (!character) {
      throw new Error(`Character ${sid} not found!`);
    }
    return { ...character }; // 返回副本以防止修改
  }
}

export const getBaseCharactersCenter = lazyGetInstanceSigleTon(
  () => new BaseCharactersCenter()
);
