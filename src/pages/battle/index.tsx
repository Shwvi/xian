import { useState, useEffect } from "react";
import { CharacterSId, IBattleAbleCharacter, ISkill } from "../../core/typing";
import { BattleSystem } from "@/core/fight";
import {
  BattleEvent,
  filterEvent,
  getCoreStream,
  IAppendBattleLogEvent,
  NormalEvent,
} from "@/core/stream";
import { getCharactersCenter } from "@/data/characters";
import { BattleDescriptionManager } from "@/core/description";
import BattleLog from "@/components/BattleLog";
import cls from "classnames";
import styles from "./index.module.less";
import BattleTimeline from "@/components/BattleTimeline";
import BattleMenu from "@/components/BattleMenu";
import BattleCharacterStatus from "@/components/BattleCharacterStatus";

export default function Battle() {
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

  useEffect(() => {
    const [initialPlayer, initialEnemy] = [
      CharacterSId.ME,
      CharacterSId.TIE_QUAN,
    ].map(getCharactersCenter().packBattleCharacter);
    const battle = new BattleSystem([initialPlayer, initialEnemy]);

    setPlayer(initialPlayer);
    setEnemy(initialEnemy);

    const $ = getCoreStream();

    const descriptionManager = new BattleDescriptionManager();

    battle.setEventStream($);
    descriptionManager.setEventStream($);

    let buffers: IAppendBattleLogEvent[] = [];
    let joinOperator = "";
    $.pipe(filterEvent(NormalEvent.APPEND_BATTLE_LOG)).subscribe(
      ({ payload }) => {
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
      }
    );

    descriptionManager.run();
    battle.run();
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

  return (
    <div className={cls("flex flex-col h-full w-full")}>
      {/* 战斗记录 */}
      <BattleLog logs={battleLogs} />

      {/* 角色狀態 */}
      <div className="flex flex-row lg:flex-row gap-4 mb-4">
        {/* 敌方状态 */}
        <div className="flex-1">
          <BattleCharacterStatus
            character={enemy}
            isActive={nextCharacter?.sid === enemy?.sid}
            type="enemy"
          />
        </div>

        {/* 玩家状态 */}
        <div className="flex-1">
          <BattleCharacterStatus
            character={player}
            isActive={nextCharacter?.sid === player?.sid}
            type="player"
          />
        </div>
      </div>

      <BattleTimeline
        characters={timelineCharacters}
        actionThreshold={1000}
        isPaused={timeControl.isPaused}
      />

      <div className="flex items-center justify-center my-2">
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

      <div className="h-4" />

      <audio src="/audio/bg_山谷.mp3" autoPlay loop />
    </div>
  );
}
