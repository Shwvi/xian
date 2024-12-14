import { CharacterSId, IBattleAbleCharacter } from "@/core/typing";
import { lazyGetInstanceSigleTon } from "@/utils/lazyGetInstanceSigleTon";
import { getBaseCharactersCenter } from "./base-characters";
import { getSkillsCenter } from "./skills";

export class CharactersCenter {
  private baseCharactersCenter = getBaseCharactersCenter();
  private skillsCenter = getSkillsCenter();

  public packBattleCharacter = (sid: CharacterSId): IBattleAbleCharacter => {
    const baseCharacter = this.baseCharactersCenter.getCharacter(sid);
    const skills = this.skillsCenter.getSkills(baseCharacter.skills);

    return {
      sid: baseCharacter.sid,
      name: baseCharacter.name,
      c_hp: baseCharacter.health_points,
      t_hp: baseCharacter.health_points,
      c_mp: baseCharacter.manna_points,
      t_mp: baseCharacter.manna_points,
      attack: baseCharacter.attack,
      defense: baseCharacter.defense,
      agility: baseCharacter.agility,
      skills,
    };
  };
}

export const getCharactersCenter = lazyGetInstanceSigleTon(
  () => new CharactersCenter()
);
