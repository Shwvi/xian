import { BaseDescriptionGenerator } from "./base";
import { IEndBattleContext } from "../typing";
import { getCharactersCenter } from "@/data/characters";

export class BattleDescriptionGenerator extends BaseDescriptionGenerator {
  protected templates = {
    battleEnd: {
      victory: [
        "战斗结束，(bisque{winnerName})以压倒性的优势取得胜利",
        "(bisque{winnerName})的实力得到了充分展现，这场战斗已经划上句点",
        "尘埃落定，(bisque{winnerName})在这场较量中展现出了非凡的实力",
        "胜负已分，(bisque{winnerName})在这场对决中技高一筹",
        "这场战斗最终以(bisque{winnerName})的胜利告终",
      ],
      draw: [
        "双方都已经精疲力竭，这场战斗以平局结束",
        "激烈的战斗过后，双方都已经到达极限",
        "这场战斗以双方都无法继续战斗而告终",
        "双方实力势均力敌，这场较量就此结束",
      ],
    },
    randomBattle: {
      intense: [
        "空气中弥漫着紧张的气息，战斗愈发激烈",
        "双方的气���不断攀升，战斗进入白热化阶段",
        "灵力的波动越来越强烈，这场战斗远未结束",
        "战斗的节奏逐渐加快，双方都在寻找致胜的机会",
      ],
      exhausted: [
        "连续的战斗消耗了双方大量的灵力，但谁都不愿认输",
        "虽然已经显露疲态，但双方的战意依然高昂",
        "灵力消耗巨大，但这场战斗还在继续",
        "即便体力不支，双方依然在坚持战斗",
      ],
    },
  };

  generate(context: IEndBattleContext): string {
    const winner = getCharactersCenter().packBattleCharacter(context.winner);

    // 如果没有胜者，说明是平局
    if (!winner) {
      return this.formatTemplate(
        this.getRandomTemplate("battleEnd", "draw"),
        {}
      );
    }

    return this.formatTemplate(this.getRandomTemplate("battleEnd", "victory"), {
      winnerName: winner.name,
    });
  }

  generateRandomBattleDescription(): string {
    // 随机选择描述类型
    const type = Math.random() > 0.5 ? "intense" : "exhausted";
    return this.formatTemplate(
      this.getRandomTemplate("randomBattle", type),
      {}
    );
  }
}
