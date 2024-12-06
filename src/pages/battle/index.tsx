import { useState, useEffect } from "react";
import { CharacterSId, IBattleAbleCharacter, ISkill } from "../../core/typing";
import { BattleSystem } from "@/core/fight";
import {
  filterEvent,
  getCoreStream,
  IAppendBattleLogEvent,
  NormalEvent,
} from "@/core/stream";
import { getCharactersCenter } from "@/data/characters";
import { BattleDescriptionManager } from "@/core/description";
import BattleLog from "@/components/BattleLog";

export default function Battle() {
  const [battleSystem, setBattleSystem] = useState<BattleSystem | null>(null);
  const [battleLogs, setBattleLogs] = useState<IAppendBattleLogEvent[]>([]);
  const [player, setPlayer] = useState<IBattleAbleCharacter | null>(null);
  const [enemy, setEnemy] = useState<IBattleAbleCharacter | null>(null);
  const [menuType, setMenuType] = useState<"main" | "skills" | "items" | null>(
    "main"
  );

  useEffect(() => {
    const [initialPlayer, initialEnemy] = [
      CharacterSId.ME,
      CharacterSId.TIE_QUAN,
    ].map(getCharactersCenter().packBattleCharacter);
    const battle = new BattleSystem([initialPlayer, initialEnemy]);
    setBattleSystem(battle);
    setPlayer(initialPlayer);
    setEnemy(initialEnemy);

    const $ = getCoreStream();

    const descriptionManager = new BattleDescriptionManager();

    battle.setEventStream($);
    descriptionManager.setEventStream($);

    $.pipe(filterEvent(NormalEvent.APPEND_BATTLE_LOG)).subscribe(
      ({ payload }) => {
        if (payload) {
          setBattleLogs((prev) => [...prev, payload]);
        }
      }
    );

    descriptionManager.run();
    battle.run();
  }, []);

  const handleSkillSelect = async (skill: ISkill) => {
    if (!battleSystem) return;

    getCoreStream().publish({
      type: NormalEvent.USER_SELECT_SKILL,
      payload: skill,
    });
  };

  const renderMainMenu = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-2 border rounded-lg cursor-pointer hover:bg-gray-700">
        <div className="text-left">
          <div className="font-bold">攻击</div>
          <div className="text-sm text-gray-400">使用基础攻击</div>
        </div>
      </div>
      <div
        className="p-2 border rounded-lg cursor-pointer hover:bg-gray-700"
        onClick={() => setMenuType("skills")}
      >
        <div className="text-left">
          <div className="font-bold">技能</div>
          <div className="text-sm text-gray-400">使用特殊技能</div>
        </div>
      </div>
      <div
        className="p-2 border rounded-lg cursor-pointer hover:bg-gray-700"
        onClick={() => setMenuType("items")}
      >
        <div className="text-left">
          <div className="font-bold">道具</div>
          <div className="text-sm text-gray-400">使用背包物品</div>
        </div>
      </div>
      {/* 可以添加更多选项 */}
    </div>
  );

  const renderSkillMenu = () => (
    <div>
      <div className="mb-2">
        <button
          className="text-sm text-gray-400 hover:text-white"
          onClick={() => setMenuType("main")}
        >
          ← 返回
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {player?.skills.map((skill) => (
          <div
            key={skill.name}
            className={`p-2 border rounded-lg ${
              skill.cost > (player?.c_mp || 0)
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-700"
            }`}
            onClick={() => handleSkillSelect(skill)}
          >
            <div className="text-left">
              <div className="font-bold">{skill.name}</div>
              <div className="text-sm text-gray-400">{skill.description}</div>
              <div className="text-sm text-blue-400">消耗: {skill.cost} MP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* 敌方状态 */}
      <div className="mb-4">
        <div className="border p-3 rounded-lg">
          <h3 className="text-lg font-bold">{enemy?.name}</h3>
          <div>
            生命值: {enemy?.c_hp}/{enemy?.t_hp}
          </div>
        </div>
      </div>

      {/* 战斗记录 */}
      <BattleLog logs={battleLogs} />

      {/* 玩家状态 */}
      <div className="mb-4">
        <div className="border p-3 rounded-lg">
          <h3 className="text-lg font-bold">{player?.name}</h3>
          <div>
            生命值: {player?.c_hp}/{player?.t_hp}
          </div>
          <div>
            灵力: {player?.c_mp}/{player?.t_mp}
          </div>
        </div>
      </div>

      {/* 菜单选择 */}
      {menuType === "main" && renderMainMenu()}
      {menuType === "skills" && renderSkillMenu()}
      {menuType === "items" && (
        <div className="text-center text-gray-400">
          <div>道具功能开发中...</div>
          <button
            className="mt-2 text-sm hover:text-white"
            onClick={() => setMenuType("main")}
          >
            ← 返回
          </button>
        </div>
      )}
    </div>
  );
}
