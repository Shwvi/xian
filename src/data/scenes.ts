import { CharacterSId, IScene, SceneId } from "@/core/typing";
import { lazyGetInstanceSigleTon } from "@/utils/lazyGetInstanceSigleTon";

export class ScenesCenter {
  private scenesMap: Map<SceneId, IScene> = new Map();

  constructor() {
    this.initializeScenes();
  }

  private initializeScenes() {
    this.scenesMap.set(SceneId.START, {
      id: SceneId.START,
      name: "山门前",
      description:
        "你站在铁山门前的青石板路上，周围古木参天，隐约可见远处的宫殿楼阁。",
      actions: [
        {
          type: "battle",
          description: "与守山弟子切磋",
          data: {
            enemyId: CharacterSId.TIE_QUAN,
          },
        },
        {
          type: "move",
          description: "进入山门",
          data: {
            targetSceneId: SceneId.MAIN_HALL,
          },
        },
      ],
    });

    this.scenesMap.set(SceneId.MAIN_HALL, {
      id: SceneId.MAIN_HALL,
      name: "大殿",
      description: "宏伟的大殿金碧辉煌，殿内香火缭绕，两侧站立着肃穆的弟子。",
      actions: [
        {
          type: "move",
          description: "前往练武场",
          data: {
            targetSceneId: SceneId.PRACTICE_GROUND,
          },
        },
        {
          type: "move",
          description: "去往丹房",
          data: {
            targetSceneId: SceneId.PILL_ROOM,
          },
        },
        {
          type: "move",
          description: "进入藏经阁",
          data: {
            targetSceneId: SceneId.LIBRARY,
          },
        },
        {
          type: "move",
          description: "前往后山禁地",
          data: {
            targetSceneId: SceneId.FORBIDDEN_AREA,
          },
        },
      ],
    });

    this.scenesMap.set(SceneId.PRACTICE_GROUND, {
      id: SceneId.PRACTICE_GROUND,
      name: "练武场",
      description:
        "宽阔的练武场上，不时传来打斗声和喝彩声，几名弟子正在切磋武艺。",
      actions: [
        {
          type: "battle",
          description: "挑战普通弟子",
          data: {
            enemyId: CharacterSId.TIE_QUAN,
          },
        },
        {
          type: "battle",
          description: "挑战精英弟子",
          data: {
            enemyId: CharacterSId.TIE_QUAN,
          },
        },
        {
          type: "move",
          description: "返回大殿",
          data: {
            targetSceneId: SceneId.MAIN_HALL,
          },
        },
      ],
    });

    this.scenesMap.set(SceneId.PILL_ROOM, {
      id: SceneId.PILL_ROOM,
      name: "丹房",
      description:
        "丹房内弥漫着各种药材的清香，炉火正旺，丹师正在专心炼制丹药。",
      actions: [
        {
          type: "talk",
          description: "向丹师请教",
          data: {},
        },
        {
          type: "move",
          description: "返回大殿",
          data: {
            targetSceneId: SceneId.MAIN_HALL,
          },
        },
      ],
    });

    this.scenesMap.set(SceneId.LIBRARY, {
      id: SceneId.LIBRARY,
      name: "藏经阁",
      description:
        "古老的藏经阁内藏书万卷，空气中飘荡着淡淡的檀香，几位弟子正在静心研读典籍。",
      actions: [
        {
          type: "move",
          description: "进入密室",
          data: {
            targetSceneId: SceneId.SECRET_CHAMBER,
          },
        },
        {
          type: "move",
          description: "返回大殿",
          data: {
            targetSceneId: SceneId.MAIN_HALL,
          },
        },
      ],
    });

    this.scenesMap.set(SceneId.FORBIDDEN_AREA, {
      id: SceneId.FORBIDDEN_AREA,
      name: "后山禁地",
      description:
        "这里是宗门禁地，瘴气弥漫，灵气紊乱。传言有上古大能在此悟道留下的机缘，也有凶险的妖兽出没。",
      actions: [
        {
          type: "battle",
          description: "挑战神秘剑客",
          data: {
            enemyId: CharacterSId.TIE_QUAN,
          },
        },
        {
          type: "move",
          description: "探索古洞",
          data: {
            targetSceneId: SceneId.ANCIENT_CAVE,
          },
        },
        {
          type: "move",
          description: "返回大殿",
          data: {
            targetSceneId: SceneId.MAIN_HALL,
          },
        },
      ],
    });

    this.scenesMap.set(SceneId.ANCIENT_CAVE, {
      id: SceneId.ANCIENT_CAVE,
      name: "古洞",
      description:
        "幽深的山洞中刻满了古老的符文，空气中充满了浓郁的灵气，似乎蕴含着不为人知的秘密。",
      actions: [
        {
          type: "battle",
          description: "对战洞中妖兽",
          data: {
            enemyId: CharacterSId.TIE_QUAN,
          },
        },
        {
          type: "move",
          description: "离开古洞",
          data: {
            targetSceneId: SceneId.FORBIDDEN_AREA,
          },
        },
      ],
    });

    this.scenesMap.set(SceneId.SECRET_CHAMBER, {
      id: SceneId.SECRET_CHAMBER,
      name: "密室",
      description:
        "这是藏经阁下的一间密室，四壁刻满了古老的功法口诀，空气中飘荡着淡淡的檀香。",
      actions: [
        {
          type: "battle",
          description: "与守护者对战",
          data: {
            enemyId: CharacterSId.TIE_QUAN,
          },
        },
        {
          type: "move",
          description: "返回藏经阁",
          data: {
            targetSceneId: SceneId.LIBRARY,
          },
        },
      ],
    });
  }

  public getScene(id: SceneId): IScene {
    const scene = this.scenesMap.get(id);
    if (!scene) {
      throw new Error(`Scene ${id} not found!`);
    }
    return { ...scene }; // 返回副本以防止修改
  }
}

export const getScenesCenter = lazyGetInstanceSigleTon(
  () => new ScenesCenter()
);
