import { CultivationLevel } from "@/core/typing";

export function cultivationLevelToText(value: CultivationLevel) {
  switch (value) {
    case CultivationLevel.ZERO:
      return "凡人";
    case CultivationLevel.ONE:
      return "炼气";
    case CultivationLevel.TWO:
      return "筑基";
    case CultivationLevel.THREE:
      return "金丹";
    case CultivationLevel.FOUR:
      return "元婴";
    case CultivationLevel.FIVE:
      return "化神";
    case CultivationLevel.SIX:
      return "炼虚";
    case CultivationLevel.SEVEN:
      return "合体";
    case CultivationLevel.EIGHT:
      return "大乘";
    case CultivationLevel.NINE:
      return "渡劫";
    default:
      return "未知";
  }
}
