// 真实的修仙，战斗系统
// 1. 回合制
// 2. 开始谁先出手由敏捷或者是否偷袭决定
// 3. 拥有反制回合，比如对手攻击的时候可以出现反制（看是否有相关技能）
// 4. 反制有可能失败，有数值机制

import {
  BattleEvent,
  EventStream,
  filterEvent,
  LogType,
  NormalEvent,
  StreamBasedSystem,
} from "./stream";
import { IBattleAbleCharacter, CharacterSId, ISkill } from "./typing";
import { isUserCharacter, isUserSid } from "./utils";
import { IAIBattleContext, BattleAI } from "./battle-ai";

export type CharacterRemainToActMap = Partial<Record<CharacterSId, true>>;

export class BattleSystem extends StreamBasedSystem {
  private characters: IBattleAbleCharacter[];
  private charactersRemainToAct: CharacterRemainToActMap = {};
  private currentTurn: number = 0;
  private battleEnd?: {
    isEnded: boolean;
    winner?: IBattleAbleCharacter;
  };

  constructor(characters: IBattleAbleCharacter[]) {
    super();
    this.characters = characters;
  }

  override setEventStream(eventStream: EventStream): void {
    super.setEventStream(eventStream);

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

  private onNewTurnStart() {
    // 重置出招记录
    this.charactersRemainToAct = this.characters.reduce((pre, next) => {
      pre[next.sid] = true;
      return pre;
    }, {} as CharacterRemainToActMap);

    this.currentTurn++;
  }

  private onNewTurnEnd() {
    this.$.publish({
      type: NormalEvent.APPEND_BATTLE_LOG,
      payload: {
        type: LogType.GAP,
        content: "",
        newParagraph: true,
      },
    });
  }

  private measureEnd() {
    if (this.battleEnd) return this.battleEnd;

    // Check for battle end before starting new turn
    const battleEnd = this.checkBattleEnd();
    if (battleEnd.isEnded) this.battleEnd = battleEnd;

    return battleEnd;
  }

  private async nextCharacterToAct() {
    const sortedCharacters = this.determineInitiative();
    const nextCharacter = sortedCharacters[0];

    if (isUserCharacter(nextCharacter)) {
      const { payload: skill } = await this.once(NormalEvent.USER_SELECT_SKILL);
      this.executeSkill(nextCharacter, skill);
    } else {
      const skill = await this.selectEnemySkill(nextCharacter);
      this.executeSkill(nextCharacter, skill);
    }

    delete this.charactersRemainToAct[nextCharacter.sid];
  }

  private async waitForAllCharactersToSkill() {
    while (Object.keys(this.charactersRemainToAct).length > 0) {
      await this.nextCharacterToAct();

      const { isEnded } = await this.measureEnd();

      if (isEnded) break;
    }
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
  }

  public async run() {
    await this.startBattle();

    while (true) {
      // 回合初始化逻辑
      await this.onNewTurnStart();

      // 每回合需要所有的角色都进行过出招判定
      await this.waitForAllCharactersToSkill();

      await this.onNewTurnEnd();

      if (this.measureEnd().isEnded) break;
    }

    await this.onBattleEnd();
  }

  // 执行选择的技能
  public async executeSkill(
    character: IBattleAbleCharacter,
    skill: ISkill
  ): Promise<void> {
    const target = this.getRandomOpponent(character);

    if (skill.cost > character.c_mp) {
      this.$.publish({
        type: BattleEvent.SKILL_USE,
        payload: {
          from: character.sid,
          to: target.sid,
          skill,
          success: false,
        },
      });
      return;
    }

    character.c_mp -= skill.cost;
    this.$.publish({
      type: BattleEvent.SKILL_USE,
      payload: {
        from: character.sid,
        to: target.sid,
        skill,
        success: true,
      },
    });

    if (skill.damage) {
      this.applyDamage(character, skill, target);
    }

    if (skill.cooldown) {
      skill.cooldown = skill.cooldown - 1;
    }
  }

  // 决定谁先出手
  private determineInitiative() {
    return this.characters
      .filter(({ sid }) => this.charactersRemainToAct[sid])
      .sort((a, b) => b.agility - a.agility);
  }

  // 应用伤害
  private applyDamage(
    attacker: IBattleAbleCharacter,
    skill: ISkill,
    target: IBattleAbleCharacter = this.getRandomOpponent(attacker)
  ): void {
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
      currentTurn: this.currentTurn,
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
