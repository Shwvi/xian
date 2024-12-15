import { TerrainType } from "@/core/map-canvas/chunk-manager/types";
import { CharacterSId, IWorldData } from "@/core/typing";

export const worldData: IWorldData[] = [
  {
    id: "human_world",
    name: "人界",
    description: "人界是修仙界最繁华的区域之一。",
    width: 100000,
    height: 100000,
    position: {
      x: 50000,
      y: 50000,
    },
    children: ["eastern_realm"],
  },
  {
    id: "eastern_realm",
    name: "东洲",
    description: "东洲灵气充沛，是修仙界最繁华的区域之一。",
    width: 1000,
    height: 1000,
    position: {
      x: 500,
      y: 500,
    },
    actions: [{ type: "move", description: "进入", target: "eastern_realm" }],
    children: ["qingyun_realm"],
  },
  {
    id: "qingyun_realm",
    name: "青云门",
    description: "青云门是东洲修仙界最强大的门派之一。",
    width: 1000,
    height: 1000,
    position: {
      x: 500,
      y: 500,
    },
    actions: [{ type: "move", description: "进入", target: "qingyun_realm" }],
    children: [
      "qingyun_main_peak",
      "qingyun_library",
      "qingyun_training_ground",
      "qingyun_sword_pavilion",
      "qingyun_elixir_hall",
      "qingyun_forbidden_area",
      "qingyun_exit",
    ],
  },
  {
    id: "qingyun_main_peak",
    name: "青云主峰",
    description:
      "青云门最高的主峰，也是门派重要事务商议之地，宗主居所就在此处。",
    width: 200,
    height: 200,
    position: {
      x: 500,
      y: 300,
    },
    actions: [{ type: "character", character: CharacterSId.TIE_QUAN }],
    children: [],
  },
  {
    id: "qingyun_library",
    name: "青云藏经阁",
    description: "收藏着青云门数千年来收集的功法秘籍，是门派最重要的建筑之一。",
    width: 150,
    height: 150,
    position: {
      x: 400,
      y: 500,
    },
    children: [],
  },
  {
    id: "qingyun_exit",
    name: "出口",
    description: "出口",
    width: 150,
    height: 150,
    position: {
      x: 500,
      y: 500,
    },
    actions: [{ type: "move", description: "离开", target: "human_world" }],
    children: [],
  },
  {
    id: "qingyun_training_ground",
    name: "青云练功场",
    description: "青云门弟子日常修炼的场所，场地宽阔，布有聚灵阵法。",
    width: 300,
    height: 300,
    position: {
      x: 600,
      y: 500,
    },
    children: [],
  },
  {
    id: "qingyun_sword_pavilion",
    name: "青云剑阁",
    description: "存放门派法器和佩剑的重地，同时也是传授剑法的重要场所。",
    width: 150,
    height: 150,
    position: {
      x: 450,
      y: 600,
    },
    children: [],
  },
  {
    id: "qingyun_elixir_hall",
    name: "青云丹房",
    description: "青云门炼丹师傅们精研丹道之处，常年丹香缭绕。",
    width: 150,
    height: 150,
    position: {
      x: 550,
      y: 600,
    },
    children: [],
  },
  {
    id: "qingyun_forbidden_area",
    name: "青云禁地",
    description: "青云门禁地，禁止弟子进入。",
    width: 100,
    height: 100,
    position: {
      x: 100,
      y: 100,
    },
    children: ["qingyun_secret_area"],
  },
  {
    id: "qingyun_secret_area",
    name: "青云密地",
    description: "青云门密地，禁止弟子进入。",
    width: 100,
    height: 100,
    position: {
      x: 0,
      y: 0,
    },
    children: [],
  },
];

export const getWorldData = (worldId: string) => {
  return worldData.find((world) => world.id === worldId);
};
