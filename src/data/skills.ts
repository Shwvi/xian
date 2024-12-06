import { SkillId, ISkill } from "@/core/typing";
import { lazyGetInstanceSigleTon } from "@/utils/lazyGetInstanceSigleTon";

export class SkillsCenter {
  private skillsMap: Map<SkillId, ISkill> = new Map();

  constructor() {
    this.initializeSkills();
  }

  private initializeSkills() {
    this.skillsMap.set(SkillId.QUAN, {
      id: SkillId.QUAN,
      name: "拳",
      description: "普普通通一拳",
      cost: 0,
      damage: 10,
    });

    this.skillsMap.set(SkillId.YU_JIAN_SHU, {
      id: SkillId.YU_JIAN_SHU,
      name: "御剑术",
      description: "基础剑法，凝聚灵力于剑身",
      cost: 15,
      damage: 25,
    });

    this.skillsMap.set(SkillId.JIN_GANG_HU_TI, {
      id: SkillId.JIN_GANG_HU_TI,
      name: "金刚护体",
      description: "运转真气形成防护罩",
      cost: 20,
      effect: "counter",
      successRate: 0.6,
    });

    this.skillsMap.set(SkillId.WU_LEI_ZHENG_FA, {
      id: SkillId.WU_LEI_ZHENG_FA,
      name: "五雷正法",
      description: "引动天雷，降下雷罚",
      cost: 35,
      damage: 50,
      cooldown: 2,
    });

    this.skillsMap.set(SkillId.TAI_YI_GUI_YUAN, {
      id: SkillId.TAI_YI_GUI_YUAN,
      name: "太乙归元",
      description: "太乙仙法，恢复生命力与灵力",
      cost: 25,
      hpRecover: 30,
      mpRecover: 20,
    });

    this.skillsMap.set(SkillId.HUN_YUAN_TIE_QUAN, {
      id: SkillId.HUN_YUAN_TIE_QUAN,
      name: "混元铁拳",
      description: "刚猛无比的拳法",
      cost: 10,
      damage: 20,
    });

    this.skillsMap.set(SkillId.JIN_ZHONG_ZHAO, {
      id: SkillId.JIN_ZHONG_ZHAO,
      name: "金钟罩",
      description: "铜皮铁骨，刀枪不入",
      cost: 30,
      effect: "defense",
    });

    this.skillsMap.set(SkillId.DA_LI_JIN_GANG_ZHI, {
      id: SkillId.DA_LI_JIN_GANG_ZHI,
      name: "大力金刚指",
      description: "佛门至强指法，可破万法",
      cost: 40,
      damage: 60,
      cooldown: 3,
    });
  }

  public getSkill(id: SkillId): ISkill {
    const skill = this.skillsMap.get(id);
    if (!skill) {
      throw new Error(`Skill ${id} not found!`);
    }
    return { ...skill }; // 返回副本以防止修改
  }

  public getSkills(ids: SkillId[]): ISkill[] {
    return ids.map((id) => this.getSkill(id));
  }
}

export const getSkillsCenter = lazyGetInstanceSigleTon(
  () => new SkillsCenter()
);
