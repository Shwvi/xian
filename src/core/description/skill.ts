import { ISkillUseBattleContext } from "../typing";
import { BaseDescriptionGenerator } from "./base";
import { getCharactersCenter } from "@/data/characters";

export class SkillDescriptionGenerator extends BaseDescriptionGenerator {
  //   protected templates = {
  //     // 技能使用失败的描述模板
  //     skillFailed: {
  //       noMp: [
  //         "想要施展{skillName}，却发现灵力不足",
  //         "试图运转{skillName}，但体内灵力枯竭",
  //         "{characterName}想要使用{skillName}，却因灵力不济而失败",
  //         "体内灵力已经枯竭，{characterName}无法施展出{skillName}",
  //         "灵力不足以支撑{skillName}的运转，{characterName}只能作罢",
  //         "{characterName}想要施展{skillName}，却感觉体内灵力如同细流般即将断绝",
  //       ],
  //     },
  //     // 技能使用成功的描述模板
  //     skillSuccess: {
  //       normal: [
  //         "{characterName}使出了{skillName}",
  //         "{characterName}施展出{skillName}",
  //         "{characterName}运转灵力，施展出了{skillName}",
  //         "只见{characterName}轻轻一动，使出了{skillName}",
  //         "{characterName}娴熟地施展出{skillName}",
  //         "伴随着灵力流转，{characterName}使出了{skillName}",
  //       ],
  //       powerful: [
  //         "{characterName}凝聚全身灵力，使出了{skillName}",
  //         "只见{characterName}手掐法诀，施展出了{skillName}",
  //         "{characterName}双手结印，释放出强大的{skillName}",
  //         "灵力在{characterName}周身流转，爆发出威力强大的{skillName}",
  //         "{characterName}全神贯注，施展出威力惊人的{skillName}",
  //         "伴随着灵力的轰鸣，{characterName}使出了{skillName}",
  //       ],
  //       desperate: [
  //         "{characterName}不顾灵力消耗，拼命施展出了{skillName}",
  //         "在危急关头，{characterName}爆发出全部潜力，使出了{skillName}",
  //         "即便已经精疲力尽，{characterName}依然咬牙使出了{skillName}",
  //         "燃烧最后一丝灵力，{characterName}拼死施展出{skillName}",
  //         "{characterName}不顾自身安危，拼尽全力释放出{skillName}",
  //         "在生死存亡之际，{characterName}爆发出惊人潜力，施展出了{skillName}",
  //       ],
  //     },
  //   };

  protected templates = {
    // 技能使用失败的描述模板
    skillFailed: {
      noMp: [
        "想要施展{skillName}，却察觉丹田内灵力早已枯竭，如同干涸的河床",
        "试图运转{skillName}，却发现灵气如泥牛入海，消失得无影无踪",
        "{characterName}双手微颤，想要催动{skillName}，但灵力不足，法诀无法成形",
        "灵力流转中断，{characterName}尝试施展{skillName}的动作如同画蛇添足，毫无成效",
        "体内灵力枯竭，{characterName}刚运起{skillName}便感到头晕目眩，难以为继",
        "灵力如细丝般难以为继，{characterName}心生无力，{skillName}终成泡影",
      ],
    },
    // 技能使用成功的描述模板
    skillSuccess: {
      normal: [
        "{characterName}轻挥衣袖，一式{skillName}悄然施展",
        "只见{characterName}双眸微闭，手掐灵诀，{skillName}随之而出",
        "{characterName}灵力催动间，{skillName}如行云流水般自然而然地成形",
        "{characterName}长啸一声，气息浩荡，施展出了{skillName}",
        "灵光一闪，{characterName}驾驭灵力，施展出了{skillName}",
        "伴随一阵灵气波动，{characterName}指尖迸发出{skillName}",
      ],
      powerful: [
        "{characterName}仰天长啸，体内灵力激荡，霎时间施展出威力无穷的{skillName}",
        "一道灵光从{characterName}掌中飞出，正是凝聚全力的{skillName}",
        "{characterName}灵诀成形，天地间灵气汇聚，化为{skillName}轰然爆发",
        "在{characterName}身后，灵光如海潮涌动，他使出了威势绝伦的{skillName}",
        "{characterName}大喝一声，全身灵力瞬间涌出，将{skillName}的威力发挥到极致",
        "天地微颤，{characterName}周身灵光骤然绽放，一式{skillName}令人瞠目",
      ],
      desperate: [
        "{characterName}双眼布满血丝，咬牙施展出了近乎自毁的{skillName}",
        "在灵力近乎枯竭之时，{characterName}拼尽最后一丝力气，勉力使出了{skillName}",
        "{characterName}周身灵气乱流，却依然强行施展出了{skillName}，透出绝境中的顽强",
        "燃烧自身精血，{characterName}将所有潜力压榨殆尽，只为释放出{skillName}",
        "在死境中，{characterName}爆发出难以置信的力量，使出了决死一搏的{skillName}",
        "丹田灵力尽散，{characterName}依然不肯认输，燃尽生机施展了{skillName}",
      ],
    },
  };

  generate(context: ISkillUseBattleContext): string {
    const { from, skill, success } = context;
    const character = getCharactersCenter().packBattleCharacter(from);

    if (!success) {
      return this.formatTemplate(
        this.getRandomTemplate("skillFailed", "noMp"),
        {
          characterName: character.name,
          skillName: skill.name,
        }
      );
    }

    // 根据剩余MP比例选择不同的描述风格
    const mpRatio = character.c_mp / character.t_mp;
    let style = "normal";

    if (mpRatio < 0.3) {
      style = "desperate";
    } else if (skill.cost > 30) {
      style = "powerful";
    }

    return this.formatTemplate(this.getRandomTemplate("skillSuccess", style), {
      characterName: character.name,
      skillName: skill.name,
    });
  }
}
