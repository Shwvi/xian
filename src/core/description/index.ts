import {
  BattleEvent,
  IAppendBattleLogEvent,
  LogType,
  NormalEvent,
} from "../stream";
import { StreamBasedSystem } from "../stream";
import { ISkillUseBattleContext, IStartBattleContext } from "../typing";
import { EnvironmentDescriptionGenerator } from "./environment";
import { SkillDescriptionGenerator } from "./skill";

export class BattleDescriptionManager extends StreamBasedSystem {
  private generators: {
    environment: EnvironmentDescriptionGenerator;
    skill: SkillDescriptionGenerator;
  };

  constructor() {
    super();
    this.generators = {
      environment: new EnvironmentDescriptionGenerator(),
      skill: new SkillDescriptionGenerator(),
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
      }
    });
  }

  private handleBattleStart(context: IStartBattleContext) {
    const descriptions = [this.generators.environment.generate(context)].filter(
      Boolean
    );
    this.publishDescription(descriptions.join("\n"));
    this.publishDescription("", { newParagraph: true });
  }

  private handleSkillUse(context: ISkillUseBattleContext) {
    const description = this.generators.skill.generate(context);
    this.publishDescription(description);
  }

  private publishDescription(
    description: string,
    options?: Pick<IAppendBattleLogEvent, "newParagraph">
  ) {
    this.$.publish({
      type: NormalEvent.APPEND_BATTLE_LOG,
      payload: {
        type: LogType.NORMAL,
        content: description,
        ...options,
      },
    });
  }
}
