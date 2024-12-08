import {
  BattleEvent,
  IAppendBattleLogEvent,
  LogType,
  NormalEvent,
} from "../stream";
import { StreamBasedSystem } from "../stream";
import {
  ISkillUseBattleContext,
  IStartBattleContext,
  ISkillDamageBattleContext,
  IEndBattleContext,
} from "../typing";
import { EnvironmentDescriptionGenerator } from "./environment";
import { SkillDescriptionGenerator } from "./skill";
import { DamageDescriptionGenerator } from "./damage";
import { BattleDescriptionGenerator } from "./battle";

export class BattleDescriptionManager extends StreamBasedSystem {
  private generators: {
    environment: EnvironmentDescriptionGenerator;
    skill: SkillDescriptionGenerator;
    damage: DamageDescriptionGenerator;
    battle: BattleDescriptionGenerator;
  };

  private currentTypingTask: Promise<void> = Promise.resolve();
  private typingSpeed: number = 20;

  constructor() {
    super();
    this.generators = {
      environment: new EnvironmentDescriptionGenerator(),
      skill: new SkillDescriptionGenerator(),
      damage: new DamageDescriptionGenerator(),
      battle: new BattleDescriptionGenerator(),
    };
  }

  public run() {
    this.$.subscribe((event) => {
      switch (event.type) {
        case BattleEvent.BATTLE_START:
          this.handleBattleStart(event.payload);
          break;
        case BattleEvent.SKILL_USE:
          this.handleSkillUse(event.payload);
          break;
        case BattleEvent.DAMAGE_DEALT:
          this.handleDamageDealt(event.payload);
          break;
        case BattleEvent.BATTLE_END:
          this.handleBattleEnd(event.payload);
          break;
      }
    });
  }

  private async typeText(
    text: string,
    options?: Pick<IAppendBattleLogEvent, "newParagraph" | "buffer">,
    controlOptions?: {
      typeSpeed?: number;
      joinOperator?: string;
    }
  ): Promise<void> {
    const speed = controlOptions?.typeSpeed || this.typingSpeed;

    // 逐字打印
    for (let i = 0; i <= text.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, speed));

      this.publishRawLog({
        type: LogType.NORMAL,
        content: text.slice(i - 1, i),
        ...options,
      });
    }

    if (controlOptions?.joinOperator)
      this.publishRawLog({
        type: LogType.NORMAL,
        content: "",
        joinOperator: "，",
      });
  }

  private publishRawLog(payload: IAppendBattleLogEvent) {
    this.$.publish({
      type: NormalEvent.APPEND_BATTLE_LOG,
      payload,
    });
  }

  private async publishDescription(
    description: string,
    options?: Pick<IAppendBattleLogEvent, "newParagraph" | "buffer">,
    controlOptions?: {
      typeSpeed?: number;
      joinOperator?: string;
    }
  ) {
    // 确保打字效果按顺序执行
    this.currentTypingTask = this.currentTypingTask.then(() =>
      this.typeText(description, options, controlOptions)
    );
    return this.currentTypingTask;
  }

  private async handleBattleStart(context: IStartBattleContext) {
    const descriptions = [this.generators.environment.generate(context)].filter(
      Boolean
    );
    await this.publishDescription(descriptions.join("\n"));
    await this.publishDescription("", { newParagraph: true, buffer: true });
  }

  private async handleSkillUse(context: ISkillUseBattleContext) {
    const description = this.generators.skill.generate(context);
    await this.publishDescription(
      description,
      {},
      {
        typeSpeed: context.skill.cost > 30 ? 40 : 20, // 强力技能打字更慢
      }
    );
    await this.publishDescription("", {}, { joinOperator: "。" });

    this.$.publish({
      type: BattleEvent.SKILL_USE_DESC_END,
    });
  }

  private async handleDamageDealt(context: ISkillDamageBattleContext) {
    const description = this.generators.damage.generate(context);
    await this.publishDescription(description);
    await this.publishDescription("", { newParagraph: true, buffer: true });

    this.$.publish({
      type: BattleEvent.DAMAGE_DEALT_DESC_END,
    });
  }

  private async handleBattleEnd(context: IEndBattleContext) {
    const description = this.generators.battle.generate(context);
    await this.publishDescription(description);

    this.$.publish({
      type: BattleEvent.BATTLE_END_DESC_END,
    });
  }

  private async publishRandomBattleDescription() {
    const description =
      this.generators.battle.generateRandomBattleDescription();
    await this.publishDescription(description, { newParagraph: true });
  }
}
