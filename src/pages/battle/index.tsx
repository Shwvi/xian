import { useState, useEffect } from "react";
import { CharacterSId, IBattleAbleCharacter, ISkill } from "../../core/typing";
import { BattleSystem } from "@/core/fight";
import {
  BattleEvent,
  eventRequester,
  filterEvent,
  getCoreStream,
  IAppendBattleLogEvent,
  NormalEvent,
  StreamBasedSystem,
} from "@/core/stream";
import { getCharactersCenter } from "@/data/characters";
import { BattleDescriptionManager } from "@/core/description";
import BattleLog from "@/components/BattleLog";
import cls from "classnames";
import BattleTimeline from "@/components/BattleTimeline";
import BattleMenu from "@/components/BattleMenu";
import BattleCharacterStatus from "@/components/BattleCharacterStatus";
import { xianCore } from "@/core/core";
import { useParams, useSearchParams } from "react-router-dom";

export default function Battle() {
  const [searchParams] = useSearchParams();
  const [battleLogs, setBattleLogs] = useState<IAppendBattleLogEvent[]>([]);
  const [player, setPlayer] = useState<IBattleAbleCharacter | null>(null);
  const [enemy, setEnemy] = useState<IBattleAbleCharacter | null>(null);
  const [menuType, setMenuType] = useState<"main" | "skills" | "items" | null>(
    "main"
  );
  const [timelineCharacters, setTimelineCharacters] = useState<
    Array<{
      character: IBattleAbleCharacter;
      currentTime: number;
      castingTime?: number;
    }>
  >([]);
  const [timeControl, setTimeControl] = useState<{
    isPaused: boolean;
  }>({ isPaused: false });
  const [isLoading, setIsLoading] = useState(true);
  const [battleEnd, setBattleEnd] = useState<{
    isEnd: boolean;
    isWin?: boolean;
  }>({ isEnd: false });

  useEffect(() => {
    const eventStream = getCoreStream();

    let battle: BattleSystem | null = null;
    let descriptionManager: BattleDescriptionManager | null = null;

    eventRequester
      .getCurrentBattle(searchParams.get("stateId")!)
      .then(async ({ enemies }) => {
        setIsLoading(false);
        const [initialPlayer, initialEnemy] = [CharacterSId.ME, enemies[0]].map(
          getCharactersCenter().packBattleCharacter
        );

        battle = new BattleSystem(eventStream, [initialPlayer, initialEnemy]);

        setPlayer(initialPlayer);
        setEnemy(initialEnemy);

        descriptionManager = new BattleDescriptionManager(eventStream);

        let buffers: IAppendBattleLogEvent[] = [];
        let joinOperator = "";
        eventStream
          .pipe(filterEvent(NormalEvent.APPEND_BATTLE_LOG))
          .subscribe(({ payload }) => {
            if (payload.joinOperator) {
              return (joinOperator = payload.joinOperator);
            }
            if (payload.buffer) {
              buffers.push(payload);
            } else {
              const currentBuffers = [...buffers];
              const currentOperator = joinOperator;
              setBattleLogs((prev) => {
                if (prev.length === 0) return [payload];

                if (payload.newParagraph || currentBuffers.length !== 0) {
                  return [...prev, ...currentBuffers, payload];
                } else {
                  prev[prev.length - 1].content +=
                    currentOperator + payload.content;
                  return [...prev];
                }
              });
              buffers = [];
              joinOperator = "";
            }
          });

        descriptionManager.run();
        const battleResult = await battle.run();
        setBattleEnd({
          isEnd: true,
          isWin: battleResult?.winner?.sid === initialPlayer?.sid,
        });
      });

    return () => {
      battle?.destroy();
      descriptionManager?.destroy();
    };
  }, []);

  useEffect(() => {
    const timelineSubscription = getCoreStream()
      .pipe(filterEvent(BattleEvent.TIMELINE_UPDATE))
      .subscribe(({ payload }) => {
        setTimelineCharacters(payload.characters);
        setTimeControl(payload.timeControl);
      });

    return () => timelineSubscription.unsubscribe();
  }, []);

  const [nextCharacter, setNextCharacter] =
    useState<IBattleAbleCharacter | null>(null);

  useEffect(() => {
    const subscriber = getCoreStream()
      .pipe(filterEvent(BattleEvent.NEXT_CHARACTER_TO_ACT))
      .subscribe(({ payload }) => {
        setNextCharacter(payload);
      });
    return () => subscriber.unsubscribe();
  }, []);

  // Loading UI
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 mb-4 mx-auto">
            <img src="/weapon.png" alt="Loading" className="invert" />
          </div>
          <div>战斗准备中...</div>
        </div>
      </div>
    );
  }

  // Battle End UI
  if (battleEnd.isEnd) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur">
          <h2 className="text-2xl mb-4">
            {battleEnd.isWin ? "战斗胜利！" : "战斗失败..."}
          </h2>
          <div className="mb-6">
            <div>战斗时长: {timelineCharacters[0]?.currentTime / 1000}秒</div>
            {/* Add more battle stats here if needed */}
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-primary rounded-full text-white"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cls("flex flex-col h-full w-full")}>
      {/* 战斗记录 */}
      <BattleLog logs={battleLogs} />

      {/* 角色狀態 */}

      <BattleTimeline
        characters={timelineCharacters}
        actionThreshold={1000}
        isPaused={timeControl.isPaused}
      />

      <div className="flex items-center justify-center my-3">
        <hr className="flex-1 h-tiny bg-gray-300 my-2" />
        <img
          src="/weapon.png"
          alt="Icon"
          className={cls(
            "w-8 h-8 mx-4 invert",
            nextCharacter?.sid === player?.sid && "animate-spin"
          )}
        />
        <hr className="flex-1 h-tiny bg-gray-300 my-2" />
      </div>

      {/* 菜单部分保持不变 */}
      <BattleMenu
        menuType={menuType}
        setMenuType={setMenuType}
        isPlayerTurn={nextCharacter?.sid === player?.sid}
        player={player}
      />

      {/* MP Bar */}
      <div className="p-2 border rounded-lg mt-2 flex gap-2">
        <div>
          <div className="flex justify-between items-end gap-1 my-1">
            <div>血量</div>
            <div className="text-xs">
              {player?.c_hp}/{player?.t_hp}
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${(player!.c_hp / player!.t_hp) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-end gap-1 my-1">
            <div>灵力</div>
            <div className="text-xs">
              {player?.c_mp}/{player?.t_mp}
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all duration-300"
              style={{ width: `${(player!.c_mp / player!.t_mp) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="h-4" />

      {/* <audio src="/audio/bg_山谷.mp3" autoPlay loop /> */}
    </div>
  );
}
