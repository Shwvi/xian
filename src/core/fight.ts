import {
  BattleEvent,
  EventStream,
  filterEvent,
  IEvent,
  NormalEvent,
  StreamBasedSystem,
} from "./stream";
import {
  IBattleAbleCharacter,
  CharacterSId,
  ISkill,
  ITimelineCharacter,
  IBattleTimeControl,
} from "./typing";
import { isUserSid } from "./utils";
import { IAIBattleContext, BattleAI } from "./battle-ai";
import { requestAnimationTimeOut, sleep } from "@/utils/sleep";

export type CharacterRemainToActMap = Partial<Record<CharacterSId, true>>;

export class BattleSystem extends StreamBasedSystem {
  private characters: IBattleAbleCharacter[];
  private timelineCharacters: ITimelineCharacter[] = [];
  private currentTime: number = 0;
  private readonly ACTION_THRESHOLD = 1000; // When character reaches this time, they can act
  private readonly TIME_STEP = 30;
  private battleEnd?: {
    isEnded: boolean;
    winner?: IBattleAbleCharacter;
  };
  private timeControl: IBattleTimeControl = {
    isPaused: false,
  };

  constructor(
    eventStream: EventStream<IEvent>,
    characters: IBattleAbleCharacter[]
  ) {
    super(eventStream);
    this.characters = characters;

    // Calculate normalized agility values based on max agility
    const maxAgility = Math.max(...characters.map((char) => char.agility));

    this.timelineCharacters = characters.map((character) => ({
      character,
      currentTime: 0,
      isActing: false,
      normalizedAgility: character.agility / maxAgility, // 保持正比关系的归一化
    }));

    const subscription = this.$.pipe(
      filterEvent(BattleEvent.REQUEST_CHARACTER_STATE)
    ).subscribe(({ payload: tsid }) => {
      const c = this.characters.find(({ sid }) => sid === tsid);
      if (c)
        this.$.publish({
          type: BattleEvent.RESPONSE_CHARACTER_STATE,
          payload: c,
        });
    });

    this.addSubscription(subscription);
  }

  private async advanceTimeline() {
    await requestAnimationTimeOut(this.TIME_STEP).promise;

    if (!this.timeControl.isPaused) {
      // 更新所有角色的时间
      this.timelineCharacters.forEach((tc) => {
        if (tc.selectedSkill && tc.castingTime !== undefined) {
          // 如果在施法中，减少施法时间
          tc.castingTime -= this.TIME_STEP;
          tc.currentTime += this.TIME_STEP; // 继续累积时间以计算施法进度
        } else if (!tc.selectedSkill && !tc.isActing) {
          // 正常累积时间
          tc.currentTime += this.TIME_STEP * tc.normalizedAgility;
        }
      });

      this.currentTime += this.TIME_STEP;
    }

    this.publishTimelineUpdate();
  }

  private publishTimelineUpdate() {
    this.$.publish({
      type: BattleEvent.TIMELINE_UPDATE,
      payload: {
        characters: this.timelineCharacters.map((tc) => ({
          character: tc.character,
          currentTime: tc.currentTime,
          castingTime: tc.castingTime,
        })),
        timeControl: this.timeControl,
      },
    });
  }

  private async handleCharacterAction(tc: ITimelineCharacter) {
    this.timeControl = {
      isPaused: true,
      pauseReason: "selecting",
      actingCharacter: tc,
    };

    tc.isActing = true;

    this.$.publish({
      type: BattleEvent.NEXT_CHARACTER_TO_ACT,
      payload: tc.character,
    });

    tc.selectedSkill =
      tc.character.sid === CharacterSId.ME
        ? (await this.once(NormalEvent.USER_SELECT_SKILL)).payload
        : await this.selectEnemySkill(tc.character);

    this.$.publish({
      type: BattleEvent.NEXT_CHARACTER_TO_ACT,
      payload: null,
    });

    // 先设置施法时间
    tc.castingTime = this.calculateCastingTime(tc.selectedSkill);
    // 再重置当前时间到阈值，这样可以正确计算施法进度
    tc.currentTime = this.ACTION_THRESHOLD;

    this.timeControl = {
      isPaused: false,
    };
  }

  private async handleSkillCasting(tc: ITimelineCharacter) {
    this.timeControl = {
      isPaused: true,
      pauseReason: "executing",
      actingCharacter: tc,
    };

    await this.executeSkill(tc.character, tc.selectedSkill!);

    await requestAnimationTimeOut(500).promise;

    // 重置所有状态
    tc.currentTime = 0;
    tc.isActing = false;
    tc.selectedSkill = undefined;
    tc.castingTime = undefined;

    this.timeControl = {
      isPaused: false,
    };
  }

  private calculateCastingTime(skill: ISkill): number {
    return (skill.cost * 0.3 + (skill.damage || 0) * 0.2) * 100;
  }

  private measureEnd() {
    if (this.battleEnd) return this.battleEnd;

    // Check for battle end before starting new turn
    const battleEnd = this.checkBattleEnd();
    if (battleEnd.isEnded) this.battleEnd = battleEnd;

    return battleEnd;
  }

  private async startBattle() {
    const enemies = this.characters.filter(({ sid }) => !isUserSid(sid));
    this.$.publish({
      type: BattleEvent.BATTLE_START,
      payload: {
        enemies: enemies.map(({ sid }) => sid),
      },
    });
  }

  private async onBattleEnd() {
    const enemies = this.characters.filter(({ sid }) => !isUserSid(sid));
    this.$.publish({
      type: BattleEvent.BATTLE_END,
      payload: {
        enemies: enemies.map(({ sid }) => sid),
        winner: this.battleEnd!.winner!.sid,
      },
    });

    await this.once(BattleEvent.BATTLE_END_DESC_END);

    this.$.publish({
      type: BattleEvent.BATTLE_END_RESULT,
      payload: {
        enemies: enemies.map(({ sid }) => sid),
        winner: this.battleEnd!.winner!.sid,
      },
    });
  }

  public async run() {
    await this.startBattle();

    while (true) {
      await this.advanceTimeline();

      const readyCharacters = this.timelineCharacters.filter(
        (tc) =>
          tc.currentTime >= this.ACTION_THRESHOLD &&
          !tc.isActing &&
          !tc.selectedSkill
      );

      for (const tc of readyCharacters) {
        await this.handleCharacterAction(tc);
      }

      const castingCompleteCharacters = this.timelineCharacters.filter(
        (tc) => tc.selectedSkill && tc.castingTime! <= 0
      );

      for (const tc of castingCompleteCharacters) {
        await this.handleSkillCasting(tc);
      }

      if (this.measureEnd().isEnded) break;
    }

    await this.onBattleEnd();

    return this.battleEnd;
  }

  // 执行选择的技能
  public async executeSkill(
    character: IBattleAbleCharacter,
    skill: ISkill
  ): Promise<void> {
    const target = this.getRandomOpponent(character);

    const success = !(skill.cost > character.c_mp);

    this.$.publish({
      type: BattleEvent.SKILL_USE,
      payload: {
        from: character.sid,
        to: target.sid,
        skill,
        success,
      },
    });

    await this.once(BattleEvent.SKILL_USE_DESC_END);

    if (!success) return;

    character.c_mp -= skill.cost;

    if (skill.damage) {
      await this.applyDamage(character, skill, target);
    }

    if (skill.cooldown) {
      skill.cooldown = skill.cooldown - 1;
    }
  }

  // 应用伤害
  private async applyDamage(
    attacker: IBattleAbleCharacter,
    skill: ISkill,
    target: IBattleAbleCharacter = this.getRandomOpponent(attacker)
  ) {
    const damage = skill.damage || 0;

    // 计算防御减免
    const defenseRatio = target.defense / (target.defense + 100); // 防御收益递减
    const reducedDamage = damage * (1 - defenseRatio);

    // 确保至少造成最小伤害（原始伤害的10%）
    const finalDamage = Math.max(
      Math.round(reducedDamage),
      Math.ceil(damage * 0.1)
    );

    target.c_hp -= finalDamage;

    this.$.publish({
      type: BattleEvent.DAMAGE_DEALT,
      payload: {
        from: attacker.sid,
        to: target.sid,
        skill,
        damage: finalDamage,
      },
    });

    await this.once(BattleEvent.DAMAGE_DEALT_DESC_END);
  }

  // 获取随机对手
  private getRandomOpponent(
    character: IBattleAbleCharacter
  ): IBattleAbleCharacter {
    return this.characters.find((c) => c !== character)!;
  }

  private selectEnemySkill(character: IBattleAbleCharacter) {
    const context: IAIBattleContext = {
      self: character,
      opponent: this.getRandomOpponent(character),
    };

    return BattleAI.selectBestSkill(context);
  }

  private checkBattleEnd(): {
    isEnded: boolean;
    winner?: IBattleAbleCharacter;
  } {
    const aliveCharacters = this.characters.filter((char) => char.c_hp > 0);

    if (aliveCharacters.length === 1) {
      return { isEnded: true, winner: aliveCharacters[0] };
    }

    if (aliveCharacters.length === 0) {
      return { isEnded: true };
    }

    return { isEnded: false };
  }
}
