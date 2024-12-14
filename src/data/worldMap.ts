import { TerrainType } from "@/core/map-canvas/chunk-manager/types";
import { IWorldMap } from "../core/typing";

export const mockWorldMap: IWorldMap = {
  width: 800,
  height: 600,
  regions: [
    {
      id: "mountain_sect",
      name: "铁剑山门",
      description: "铁剑宗所在，灵气浓郁，是修炼的绝佳之地。",
      terrain: TerrainType.MOUNTAIN,
      shape: {
        type: "polygon",
        points: [
          { x: 350, y: 150 },
          { x: 400, y: 120 },
          { x: 450, y: 150 },
          { x: 450, y: 200 },
          { x: 400, y: 250 },
          { x: 350, y: 200 },
        ],
      },
      requiredLevel: 0,
      environmentEffects: [
        {
          type: "spiritual_energy",
          value: 20,
        },
      ],
      dangerLevel: 1,
      resources: ["铁矿", "灵草"],
      specialEvents: ["遇见同门", "发现秘籍"],
    },
    {
      id: "sacred_lake",
      name: "碧波湖",
      description: "传说中的神兽栖息之地，湖水蕴含神秘力量。",
      terrain: TerrainType.WATER,
      shape: {
        type: "circle",
        points: {
          center: { x: 500, y: 200 },
          radius: 75,
        },
      },
      requiredLevel: 3,
      environmentEffects: [
        {
          type: "spiritual_energy",
          value: 50,
        },
        {
          type: "water_affinity",
          value: 30,
        },
      ],
      dangerLevel: 4,
      resources: ["灵鱼", "水灵珠"],
      specialEvents: ["遇见神兽", "获得传承"],
    },
    {
      id: "forbidden_forest",
      name: "万毒林",
      description: "充满剧毒的远古森林，传闻有绝世毒经藏于其中。",
      terrain: TerrainType.FOREST,
      shape: {
        type: "polygon",
        points: [
          { x: 200, y: 300 },
          { x: 250, y: 350 },
          { x: 200, y: 400 },
          { x: 150, y: 350 },
        ],
      },
      requiredLevel: 5,
      environmentEffects: [
        {
          type: "poison_damage",
          value: -10,
        },
        {
          type: "poison_resistance",
          value: 20,
        },
      ],
      dangerLevel: 5,
      resources: ["毒草", "兽骨"],
      specialEvents: ["毒王现世", "得到毒经"],
    },
    {
      id: "forbidden_forest2",
      name: "万毒林",
      description: "充满剧毒的远古森林，传闻有绝世毒经藏于其中。",
      terrain: TerrainType.FOREST,
      shape: {
        type: "polygon",
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 30 },
          { x: 20, y: 30 },
          { x: 20, y: 0 },
        ],
      },
      requiredLevel: 5,
      environmentEffects: [
        {
          type: "poison_damage",
          value: -10,
        },
        {
          type: "poison_resistance",
          value: 20,
        },
      ],
      dangerLevel: 5,
      resources: ["毒草", "兽骨"],
      specialEvents: ["毒王现世", "得到毒经"],
    },
  ],
  paths: [
    {
      start: "mountain_sect",
      end: "sacred_lake",
      type: "road",
    },
    {
      start: "mountain_sect",
      end: "forbidden_forest",
      type: "dangerous",
    },
  ],
};
