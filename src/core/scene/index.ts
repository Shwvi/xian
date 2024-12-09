import { lazyGetInstanceSigleTon } from "@/utils/lazyGetInstanceSigleTon";
import {
  BattleEvent,
  eventProvider,
  EventStream,
  filterEvent,
  getCoreStream,
  IEvent,
  RequestEvent,
  StageEvent,
  StreamBasedSystem,
} from "../stream";
import { CharacterSId, IScene, ISceneState, SceneId } from "../typing";
import { navigateTo } from "@/utils/navigation";
import { generateUniqId } from "@/utils/uid";
import { getScenesCenter } from "@/data/scenes";

export class SceneManager extends StreamBasedSystem {
  private scenes: Map<string, IScene> = new Map();
  private state: ISceneState = {
    currentSceneId: SceneId.START,
  };
  private scenesCenter = getScenesCenter();

  constructor(eventStream: EventStream<IEvent>) {
    super(eventStream);
  }

  public initialize() {
    // 初始化所有场景
    Object.values(SceneId).forEach((sceneId) => {
      const scene = this.scenesCenter.getScene(sceneId);
      this.scenes.set(sceneId, scene);
    });

    navigateTo("/scene");
  }

  public getCurrentScene(): IScene {
    const scene = this.scenes.get(this.state.currentSceneId);
    if (!scene) throw new Error(`Scene ${this.state.currentSceneId} not found`);
    return scene;
  }

  public async performAction(actionIndex: number) {
    const currentScene = this.getCurrentScene();
    const action = currentScene.actions[actionIndex];

    if (!action) throw new Error("Invalid action index");

    switch (action.type) {
      case "battle": {
        const stateId = generateUniqId();

        this.$.publish({
          type: StageEvent.STAGE_SWITCH,
          payload: {
            path: "/battle",
            stateId,
          },
        });

        await eventProvider.provideCurrentBattle(stateId, {
          enemies: [action.data.enemyId!],
        });

        const battleEndResult = await this.once(BattleEvent.BATTLE_END_RESULT);

        if (battleEndResult.payload.winner === CharacterSId.ME) {
          //   this.state.currentSceneId = "main_hall";
          //   this.publishSceneUpdate();
        }

        break;
      }
      case "move":
        if (action.data.targetSceneId) {
          this.moveSceneUpdate(action.data.targetSceneId);
        }
        break;
    }
  }

  private moveSceneUpdate(sceneId: string) {
    this.state.currentSceneId = sceneId;

    this.$.publish({
      type: BattleEvent.SCENE_UPDATE,
      payload: {
        scene: this.getCurrentScene(),
        state: this.state,
      },
    });
  }
}

export const getSceneManager = lazyGetInstanceSigleTon(() => {
  const sceneManager = new SceneManager(getCoreStream());
  return sceneManager;
});
