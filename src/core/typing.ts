import { TerrainType } from "./map-canvas/chunk-manager/types";

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

export enum CultivationLevel {
  // 凡人
  ZERO,
  // 炼气
  ONE,
  // 筑基
  TWO,
  // 金丹
  THREE,
  // 元婴
  FOUR,
  // 化神
  FIVE,
  // 炼虚
  SIX,
  // 合体
  SEVEN,
  // 大乘
  EIGHT,
  // 渡劫
  NINE,
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

  cultivation_level: CultivationLevel;

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

export interface ITimelineCharacter {
  character: IBattleAbleCharacter;
  currentTime: number;
  isActing: boolean;
  actionEndTime?: number;
  normalizedAgility: number;
  selectedSkill?: ISkill;
  castingTime?: number;
}

export interface IBattleTimeControl {
  isPaused: boolean;
  pauseReason?: "selecting" | "casting" | "executing";
  actingCharacter?: ITimelineCharacter;
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

export interface IScenePosition {
  x: number;
  y: number;
}

export interface ISceneState {
  currentSceneId: string;
  discoveredScenes: Set<string>;
  lifeSpanUsed: number;
}

export enum SceneId {
  START = "start",
  MAIN_HALL = "main_hall",
  PRACTICE_GROUND = "practice_ground",
  PILL_ROOM = "pill_room",
  LIBRARY = "library",
  FORBIDDEN_AREA = "forbidden_area",
  ANCIENT_CAVE = "ancient_cave",
  SECRET_CHAMBER = "secret_chamber",
}

export interface IMapRegion {
  id: string;
  name: string;
  description: string;
  terrain: TerrainType;
  shape: {
    type: "polygon" | "circle";
    points:
      | { x: number; y: number }[]
      | { center: { x: number; y: number }; radius: number };
  };
  requiredLevel: CultivationLevel;
  environmentEffects: {
    type: string;
    value: number;
  }[];
  dangerLevel: number;
  resources: string[];
  specialEvents?: string[];
}

export interface IWorldMap {
  width: number;
  height: number;
  regions: IMapRegion[];
  paths: {
    start: string;
    end: string;
    type: "road" | "secret" | "dangerous";
  }[];
}

// 大区域类型
export interface IRegion {
  id: string;
  name: string;
  description: string;
  landmarks: ILandmark[];
  terrain: TerrainType;
  position: {
    x: number;
    y: number;
  };
}

// 地标类型
export interface ILandmark {
  id: string;
  name: string;
  description: string;
  type: "sect" | "city" | "dungeon" | "wilderness" | string;
  position: {
    x: number;
    y: number;
  };
  scenes: IScene[];
}

// 具体场景类型
export interface IScene {
  id: string;
  name: string;
  description: string;
  actions: ISceneAction[];
  requirements?: {
    level?: number;
    items?: string[];
  };
}

export interface ISceneAction {
  type: "move" | "battle" | "talk" | "gather" | "craft" | string;
  description: string;
  data: {
    targetSceneId?: string;
    npcId?: string;
    itemId?: string;
    recipeId?: string;
    [key: string]: any;
  };
}

export interface IWorldData {
  regions: IRegion[];
}
