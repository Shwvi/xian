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
              neighbors: ["alchemy_room", "library"],
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
              ],
            },
            {
              id: "alchemy_room",
              name: "丹房",
              description: "炼丹房内丹炉林立，药香四溢。",
              position: { x: 100, y: 50 },
              neighbors: ["main_hall"],
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
              ],
            },
          ],
        },
        {
          id: "celestial_peak",
          name: "天枢峰",
          type: "sacred_ground",
          description: "东洲最高峰，常年云雾缭绕，传说山顶有上古遗迹。",
          position: { x: 100, y: 180 },
          scenes: [
            {
              id: "peak_entrance",
              name: "峰门",
              description: "天枢峰入口，有强大的阵法守护。",
              actions: [
                {
                  type: "move",
                  description: "攀登峰顶",
                  data: { targetSceneId: "summit" },
                },
              ],
            },
            {
              id: "summit",
              name: "峰顶秘境",
              description: "云海之上的神秘空间，遍布上古修士留下的传承。",
              actions: [
                {
                  type: "cultivate",
                  description: "感悟天道",
                  data: { cultivationType: "enlightenment" },
                },
                {
                  type: "move",
                  description: "返回峰门",
                  data: { targetSceneId: "peak_entrance" },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "western_realm",
      name: "西洲",
      description: "西洲多荒漠与绿洲，神秘的西域文明在此繁衍。",
      terrain: TerrainType.MOUNTAIN,
      position: { x: -500, y: 0 },
      landmarks: [
        {
          id: "mirage_city",
          name: "蜃楼城",
          type: "city",
          description: "西洲最大的修真城市，时隐时现如同海市蜃楼。",
          position: { x: -450, y: 50 },
          scenes: [
            {
              id: "market_district",
              name: "百宝市",
              description: "热闹的市集，各种奇珍异宝应有尽有。",
              actions: [
                {
                  type: "trade",
                  description: "与商人交易",
                  data: { merchantId: "rare_goods" },
                },
                {
                  type: "move",
                  description: "前往炼器坊",
                  data: { targetSceneId: "forge" },
                },
              ],
            },
            {
              id: "forge",
              name: "千炼坊",
              description: "西洲最负盛名的炼器之地。",
              actions: [
                {
                  type: "craft",
                  description: "打造法器",
                  data: { craftingType: "weapon" },
                },
                {
                  type: "move",
                  description: "返回市集",
                  data: { targetSceneId: "market_district" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
