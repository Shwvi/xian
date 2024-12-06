import { IBattleContext, IStartBattleContext } from "../typing";
import { BaseDescriptionGenerator } from "./base";

export class EnvironmentDescriptionGenerator extends BaseDescriptionGenerator {
  protected templates = {
    // 天气描述模板
    weather: {
      晴朗: [
        "天空清澈如洗，灵气在阳光下流转",
        "和煦的阳光洒落，为战场增添几分温度",
      ],
      阴雨: [
        "细雨绵绵，为战场蒙上一层水雾",
        "乌云密布，雨滴打在地面发出沉闷的声响",
      ],
      // ... 更多天气模板
    },

    // 时间描述模板
    timeOfDay: {
      黎明: [
        "晨曦微露，第一缕阳光穿透云层",
        "破晓时分，天地间充满着清新的气息",
      ],
      // ... 更多时间模板
    },

    // 地形描述模板
    terrain: {
      山巅: ["在这云雾缭绕的山巅之上", "险峻的山峰之巅，两位强者隔空对峙"],
      // ... 更多地形模板
    },

    // 氛围描述模板
    atmosphere: {
      紧张: ["空气中弥��着令人窒息的压迫感", "剑拔弩张的气氛让人不寒而栗"],
      // ... 更多氛围模板
    },
  };

  generate(context: IStartBattleContext): string {
    const weather = this.getRandomTemplate("weather", "阴雨");
    const timeOfDay = this.getRandomTemplate("timeOfDay", "黎明");

    return [weather, timeOfDay].join(",");
  }
}
