import { sleep } from "@/utils/sleep";
import { IBattleAbleCharacter, ISkill } from "./typing";

export interface IAIBattleContext {
  self: IBattleAbleCharacter;
  opponent: IBattleAbleCharacter;
  currentTurn: number;
}

export interface ISkillScore {
  skill: ISkill;
  score: number;
}

export class BattleAI {
  // 评分权重配置
  private static readonly WEIGHTS = {
    DAMAGE_WEIGHT: 1.5,
    MP_EFFICIENCY_WEIGHT: 1.0,
    HP_SITUATION_WEIGHT: 1.2,
    COUNTER_WEIGHT: 0.8,
  };

  // 为每个技能评分
  private static evaluateSkill(
    skill: ISkill,
    context: IAIBattleContext
  ): ISkillScore {
    let score = 0;
    const { self, opponent } = context;

    // 基础可用性检查
    if (skill.cost > self.c_mp) {
      return { skill, score: -1 };
    }

    // 伤害效率评分
    if (skill.damage) {
      const damageScore =
        (skill.damage / skill.cost) * this.WEIGHTS.DAMAGE_WEIGHT;
      score += damageScore;
    }

    // MP 效率评分
    const mpEfficiencyScore =
      (1 - skill.cost / self.t_mp) * this.WEIGHTS.MP_EFFICIENCY_WEIGHT;
    score += mpEfficiencyScore;

    // 基于生命值状况的评分
    const selfHpPercentage = self.c_hp / self.t_hp;
    const opponentHpPercentage = opponent.c_hp / opponent.t_hp;

    if (selfHpPercentage < 0.3) {
      // 生命值低时倾向于使用防御性技能
      if (skill.effect === "counter") {
        score += this.WEIGHTS.COUNTER_WEIGHT * 1.5;
      }
    }

    if (opponentHpPercentage < 0.2 && skill.damage) {
      // 对手生命值低时优先选择伤害技能
      score += this.WEIGHTS.DAMAGE_WEIGHT * 1.2;
    }

    return { skill, score };
  }

  // 选择最佳技能
  public static async selectBestSkill(context: IAIBattleContext) {
    await sleep(1000);

    const { self } = context;

    // 评估所有技能
    const skillScores = self.skills
      .map((skill) => this.evaluateSkill(skill, context))
      .filter(({ score }) => score >= 0);

    // 按分数排序
    skillScores.sort((a, b) => b.score - a.score);

    // 添加一些随机性，避免行为过于机械
    const topSkills = skillScores.slice(0, Math.min(3, skillScores.length));
    const randomIndex = Math.floor(Math.random() * topSkills.length);

    return topSkills[randomIndex].skill;
  }
}
