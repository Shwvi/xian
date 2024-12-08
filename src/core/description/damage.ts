import { BaseDescriptionGenerator } from "./base";
import { ISkillDamageBattleContext } from "../typing";
import { getCharactersCenter } from "@/data/characters";

export class DamageDescriptionGenerator extends BaseDescriptionGenerator {
  protected templates = {
    damage: {
      light: [
        "{targetName}受到了(red{damage}点)伤害",
        "{targetName}受到(red{damage}点)轻微伤害",
        "{targetName}勉强抵挡，受到(red{damage}点)伤害",
        "{targetName}受到(red{damage}点)轻微创伤",
        "{targetName}略显狼狈，损失(red{damage}点)生命",
      ],
      medium: [
        "{targetName}遭受(red{damage}点)伤害",
        "{targetName}受到(red{damage}点)显著伤害",
        "{targetName}承受(red{damage}点)伤害",
        "{targetName}连连后退，损失(red{damage}点)生命",
        "{targetName}被击中要害，受到(red{damage}点)伤害",
      ],
      heavy: [
        "{targetName}遭受(red{damage}点)致命伤害",
        "{targetName}遭受(red{damage}点)重创",
        "{targetName}受到(red{damage}点)严重伤害",
        "{targetName}遭受(red{damage}点)沉重打击",
        "{targetName}遭受(red{damage}点)重创",
      ],
    },
  };

  generate(context: ISkillDamageBattleContext): string {
    const { to, skill, damage } = context;
    const target = getCharactersCenter().packBattleCharacter(to);

    // 根据伤害占目标最大生命值的比例来选择描述类型
    let damageType: "light" | "medium" | "heavy" = "light";
    const damageRatio = damage / target.t_hp;

    if (damageRatio > 0.3) {
      damageType = "heavy";
    } else if (damageRatio > 0.15) {
      damageType = "medium";
    }

    return this.formatTemplate(this.getRandomTemplate("damage", damageType), {
      targetName: target.name,
      damage: damage.toString(),
    });
  }
}
