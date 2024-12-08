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
        "(bisque{characterName})想要施展(blue{skillName})，却察觉丹田内灵力早已枯竭，如同干涸的河床",
        "试图运转(blue{skillName})，却发现灵气如泥牛入海，消失得无影无踪",
        "(bisque{characterName})双手微颤，想要催动(blue{skillName})，但灵力不足，法诀无法成形",
        "灵力流转中断，(bisque{characterName})尝试施展(blue{skillName})的动作如同画蛇添足，毫无成效",
        "体内灵力枯竭，(bisque{characterName})刚运起(blue{skillName})便感到头晕目眩，难以为继",
        "灵力如细丝般难以为继，(bisque{characterName})心生无力，(blue{skillName})终成泡影",
        "丹田空虚，(bisque{characterName})想要施展(blue{skillName})的念头只能成为泡影",
        "灵力枯竭如同枯井，(bisque{characterName})无法凝聚足够真气施展(blue{skillName})",
        "(bisque{characterName})手诀刚起，便感觉浑身虚脱，(blue{skillName})难以为继",
        "灵脉阻塞，(bisque{characterName})勉强提起的一丝灵力还未成形便已消散，(blue{skillName})自然无法施展",
        "体内灵力早已告罄，(bisque{characterName})想要施展(blue{skillName})却只能徒劳无功",
        "真气运转受阻，(bisque{characterName})欲施展(blue{skillName})却感觉四肢百骸都在抗拒",
      ],
    },
    // 技能使用成功的描述模板
    skillSuccess: {
      normal: [
        "(bisque{characterName})轻挥衣袖，一式(blue{skillName})悄然施展",
        "只见(bisque{characterName})双眸微闭，手掐灵诀，(blue{skillName})随之而出",
        "(bisque{characterName})灵力催动间，(blue{skillName})如行云流水般自然而然地成形",
        "(bisque{characterName})长啸一声，气息浩荡，施展出了(blue{skillName})",
        "灵光一闪，(bisque{characterName})驾驭灵力，施展出了(blue{skillName})",
        "伴随一阵灵气波动，(bisque{characterName})指尖迸发出(blue{skillName})",
        "(bisque{characterName})手掐玄妙法诀，(blue{skillName})随心而发",
        "但见(bisque{characterName})身形一动，(blue{skillName})已然施展而出",
        "(bisque{characterName})指尖灵光流转，(blue{skillName})如臂使指般轻松施展",
        "随着(bisque{characterName})一声轻吟，(blue{skillName})的光华已然绽放",
        "只见(bisque{characterName})神态从容，(blue{skillName})在其手中信手拈来",
        "伴随着清风拂过，(bisque{characterName})的(blue{skillName})已然成形",
      ],
      powerful: [
        "(bisque{characterName})仰天长啸，体内灵力激荡，霎时间施展出威力无穷的(blue{skillName})",
        "一道灵光从(bisque{characterName})掌中飞出，正是凝聚全力的(blue{skillName})",
        "(bisque{characterName})灵诀成形，天地间灵气汇聚，化为(blue{skillName})轰然爆发",
        "(bisque{characterName})大喝一声，全身灵力瞬间涌出，将(blue{skillName})的威力发挥到极致",
        "天地微颤，(bisque{characterName})周身灵光骤然绽放，一式(blue{skillName})令人瞠目",
        "(bisque{characterName})双手结印，刹那间天地灵气汇聚，释放出威力惊人的(blue{skillName})",
        "伴随着震耳欲聋的龙吟声，(bisque{characterName})施展出了气势磅礴的(blue{skillName})",
        "(bisque{characterName})周身灵光大盛，一式(blue{skillName})携带着排山倒海之势",
        "天地为之变色，(bisque{characterName})施展的(blue{skillName})威能已达极致",
        "只见(bisque{characterName})气势陡然一变，祭出了足以开天辟地的(blue{skillName})",
        "灵气化作实质般的光华，(bisque{characterName})的(blue{skillName})威力已臻化境",
      ],
      desperate: [
        "(bisque{characterName})双眼布满血丝，咬牙施展出了近乎自毁的(blue{skillName})",
        "在灵力近乎枯竭之时，(bisque{characterName})拼尽最后一丝力气，勉力使出了(blue{skillName})",
        "(bisque{characterName})周身灵气乱流，却依然强行施展出了(blue{skillName})，透出绝境中的顽强",
        "燃烧自身精血，(bisque{characterName})将所有潜力压榨殆尽，只为释放出(blue{skillName})",
        "(bisque{characterName})在死境中，爆发出难以置信的力量，使出了决死一搏的(blue{skillName})",
        "(bisque{characterName})丹田灵力尽散，依然不肯认输，燃尽生机施展了(blue{skillName})",
        "(bisque{characterName})面露狰狞，不惜燃烧精元施展出了(blue{skillName})",
        "(bisque{characterName})即便经脉寸断，依然强行催动最后一丝灵力使出(blue{skillName})",
        "(bisque{characterName})生死关头，燃烧本源，爆发出惊天动地的(blue{skillName})",
        "(bisque{characterName})口吐鲜血，却借着这股气血之力施展出了(blue{skillName})",
        "(bisque{characterName})明知必死无疑，依然选择燃尽生机施展(blue{skillName})",
        "(bisque{characterName})在绝境之中，燃烧三魂七魄，爆发出最后一击(blue{skillName})",
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
