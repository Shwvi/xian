import { TerrainType } from "@/core/map-canvas/chunk-manager/types";
import { CharacterSId, IWorldData } from "@/core/typing";

export const worldData: IWorldData = {
  regions: [
    {
      id: "eastern_realm",
      name: "东洲",
      description: "东洲灵气充沛，是修仙界最繁华的区域之一。",
      terrain: TerrainType.MOUNTAIN,
      position: { x: 0, y: 0 },
      landmarks: [
        {
          id: "qingyun_sect",
          name: "青云宗",
          type: "sect",
          description:
            "东洲最大的修仙门派之一，拥有深厚的修仙底蕴，门内主要修炼剑道，门主为剑仙，门内弟子皆为剑修，其中以天地一剑闻名天下",
          position: { x: 300, y: 150 },
          scenes: [
            {
              id: "main_hall",
              name: "大殿",
              description: "青云宗的主殿，金碧辉煌。",
              position: { x: 10, y: 10 },
              neighbors: ["alchemy_room", "library", "sword_pavilion"],
              actions: [
                {
                  type: "move",
                  description: "前往丹房",
                  data: { targetSceneId: "alchemy_room" },
                },
                {
                  type: "battle",
                  description: "与青云宗弟子切磋",
                  data: {
                    enemies: [CharacterSId.TIE_QUAN],
                  },
                },
                {
                  type: "move",
                  description: "去往藏经阁",
                  data: { targetSceneId: "library" },
                },
                {
                  type: "move",
                  description: "前往剑阁",
                  data: { targetSceneId: "sword_pavilion" },
                },
              ],
            },
            {
              id: "sword_pavilion",
              name: "剑阁",
              description:
                "青云宗剑修修炼之地，千百年来不知有多少剑道高手在此悟道。",
              position: { x: 50, y: 30 },
              neighbors: ["main_hall"],
              actions: [
                {
                  type: "cultivate",
                  description: "参悟剑道",
                  data: { cultivationType: "sword" },
                },
                {
                  type: "battle",
                  description: "与剑修切磋",
                  data: { enemies: [CharacterSId.TIE_QUAN] },
                },
                {
                  type: "move",
                  description: "返回大殿",
                  data: { targetSceneId: "main_hall" },
                },
              ],
            },
            {
              id: "alchemy_room",
              name: "丹房",
              description: "炼丹房内丹炉林立，药香四溢。",
              position: { x: 100, y: 50 },
              neighbors: ["main_hall", "herb_garden"],
              actions: [
                {
                  type: "craft",
                  description: "炼制丹药",
                  data: { recipeId: "basic_pill" },
                },
                {
                  type: "move",
                  description: "返回大殿",
                  data: { targetSceneId: "main_hall" },
                },
                {
                  type: "move",
                  description: "前往药园",
                  data: { targetSceneId: "herb_garden" },
                },
              ],
            },
            {
              id: "herb_garden",
              name: "药园",
              description: "各种珍稀灵药在此培育，灵气浓郁。",
              position: { x: 120, y: 60 },
              neighbors: ["alchemy_room"],
              actions: [
                {
                  type: "gather",
                  description: "采集灵药",
                  data: { itemId: "spirit_herb" },
                },
                {
                  type: "move",
                  description: "返回丹房",
                  data: { targetSceneId: "alchemy_room" },
                },
              ],
            },
          ],
        },
        {
          id: "mystic_market",
          name: "玄市",
          type: "city",
          description: "东洲最大的修仙坊市，各种天材地宝、法器丹药应有尽有。",
          position: { x: 200, y: 100 },
          scenes: [
            {
              id: "market_square",
              name: "市集广场",
              description: "熙熙攘攘的广场上，各色摊位林立。",
              position: { x: 0, y: 0 },
              neighbors: ["weapon_shop", "pill_shop", "artifact_shop"],
              actions: [
                {
                  type: "trade",
                  description: "浏览商品",
                  data: { merchantId: "general_merchant" },
                },
                {
                  type: "move",
                  description: "去往兵器阁",
                  data: { targetSceneId: "weapon_shop" },
                },
              ],
            },
            {
              id: "weapon_shop",
              name: "兵器阁",
              description: "各式法器、灵剑陈列其中。",
              position: { x: 30, y: 30 },
              neighbors: ["market_square"],
              actions: [
                {
                  type: "trade",
                  description: "购买法器",
                  data: { merchantId: "weapon_merchant" },
                },
                {
                  type: "move",
                  description: "返回广场",
                  data: { targetSceneId: "market_square" },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "southern_realm",
      name: "南洲",
      description: "南洲气候温暖，多雨林瀑布，盛产各类灵药。",
      terrain: TerrainType.FOREST,
      position: { x: 0, y: 500 },
      landmarks: [
        {
          id: "medicine_valley",
          name: "药王谷",
          type: "sect",
          description: "南洲最负盛名的炼丹门派，谷中遍布珍稀灵药。",
          position: { x: 50, y: 550 },
          scenes: [
            {
              id: "valley_entrance",
              name: "谷口",
              description: "药王谷入口，远远便能闻到沁人心脾的药香。",
              position: { x: 0, y: 0 },
              neighbors: ["medicine_hall", "herb_field"],
              actions: [
                {
                  type: "move",
                  description: "进入丹殿",
                  data: { targetSceneId: "medicine_hall" },
                },
                {
                  type: "gather",
                  description: "采集常见药材",
                  data: { itemId: "common_herb" },
                },
              ],
            },
            {
              id: "medicine_hall",
              name: "丹殿",
              description: "药王谷主殿，终日丹火不熄。",
              position: { x: 20, y: 20 },
              neighbors: ["valley_entrance"],
              actions: [
                {
                  type: "learn",
                  description: "学习炼丹术",
                  data: { skillId: "basic_alchemy" },
                },
                {
                  type: "craft",
                  description: "炼制丹药",
                  data: { recipeId: "advanced_pill" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
