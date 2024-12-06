export enum CharacterSId {
  ME,
  TIE_QUAN,
}

export enum SkillId {
  QUAN,
  YU_JIAN_SHU,
  JIN_GANG_HU_TI,
  WU_LEI_ZHENG_FA,
  TAI_YI_GUI_YUAN,
  HUN_YUAN_TIE_QUAN,
  JIN_ZHONG_ZHAO,
  DA_LI_JIN_GANG_ZHI,
}

export type IBaseCharacter = {
  // 唯一标识
  sid: CharacterSId;

  name: string;
  age: number;
  life_span: number;

  health_points: number;
  manna_points: number;

  attack: number;
  defense: number;
  agility: number;

  skills: SkillId[];
};

export interface IBattleAbleCharacter
  extends Pick<IBaseCharacter, "sid" | "name"> {
  c_hp: number;
  t_hp: number;
  c_mp: number;
  t_mp: number;

  attack: number;
  defense: number;
  agility: number;

  skills: ISkill[];
}

export interface ISkill {
  id: SkillId;
  name: string;
  description: string;
  cost: number;
  damage?: number;
  effect?: string;
  cooldown?: number;
  successRate?: number;

  hpRecover?: number;
  mpRecover?: number;
}

export interface IBaseBattleContext {}

export interface IStartBattleContext extends IBaseBattleContext {
  enemies: CharacterSId[];
}

export interface IEndBattleContext extends IBaseBattleContext {
  winner: CharacterSId;
  enemies: CharacterSId[];
}

export interface ISkillUseBattleContext extends IBaseBattleContext {
  from: CharacterSId;
  to: CharacterSId;
  skill: ISkill;
  success: boolean;
}

export interface ISkillDamageBattleContext extends IBaseBattleContext {
  from: CharacterSId;
  to: CharacterSId;
  skill: ISkill;
  damage: number;
}

export type IBattleContext =
  | IStartBattleContext
  | ISkillUseBattleContext
  | ISkillDamageBattleContext;
