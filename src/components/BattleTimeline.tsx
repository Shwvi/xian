import { IBattleAbleCharacter } from "@/core/typing";
import { useMemo } from "react";
import cls from "classnames";

interface IBattleTimelineProps {
  characters: {
    character: IBattleAbleCharacter;
    currentTime: number;
    castingTime?: number;
  }[];
  actionThreshold: number;
  isPaused: boolean;
}

export default function BattleTimeline({
  characters,
  actionThreshold,
  isPaused,
}: IBattleTimelineProps) {
  // 固定施法时间区域为动作阈值的 30%
  const CASTING_ZONE_RATIO = 0.3;
  const ACTION_ZONE_RATIO = 0.7;

  // 计算位置的百分比
  const getPositionPercentage = (time: number, castingTime?: number) => {
    if (time >= actionThreshold && castingTime !== undefined) {
      // 如果在施法中，计算施法进度
      const castingProgress =
        (time - actionThreshold) / (actionThreshold * CASTING_ZONE_RATIO);
      const position =
        ACTION_ZONE_RATIO * 100 + castingProgress * CASTING_ZONE_RATIO * 5;
      // 确保不超过总长度
      return Math.min(position, 98);
    } else if (time >= actionThreshold) {
      // 到达动作阈值但还未开始施法
      return ACTION_ZONE_RATIO * 100;
    } else {
      // 在动作阈值之前
      return (time / actionThreshold) * ACTION_ZONE_RATIO * 100;
    }
  };

  return (
    <div className="w-full my-6">
      <div className="relative">
        {/* 时间轴背景 */}
        <div className="absolute w-full h-1 top-1/2 -translate-y-1/2">
          {/* 动作阈值之前的部分 */}
          <div
            className="h-full bg-gray-600 absolute top-0 left-0"
            style={{
              width: `${ACTION_ZONE_RATIO * 100}%`,
            }}
          />
          {/* 施法时间部分 */}
          <div
            className="h-full bg-red-600/30 absolute top-0 right-0"
            style={{
              width: `${CASTING_ZONE_RATIO * 100}%`,
              marginLeft: `${ACTION_ZONE_RATIO * 100}%`,
            }}
          />

          {/* 动作阈值标记线 */}
          <div
            className="absolute w-0.5 h-4 bg-yellow-400 top-1/2 -translate-y-1/2"
            style={{
              left: `${ACTION_ZONE_RATIO * 100}%`,
            }}
          />
        </div>

        {/* 角色标记 */}
        {characters.map(({ character, currentTime, castingTime }, index) => (
          <div
            key={character.sid}
            className={cls(
              "absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-100",
              "w-4 h-4 rounded-full border-2",
              isPaused ? "animate-pulse" : "animate-none",
              character.sid === 0
                ? "border-blue-500 bg-blue-300"
                : "border-red-500 bg-red-300"
            )}
            style={{
              left: `${getPositionPercentage(currentTime, castingTime)}%`,
              top: "50%",
            }}
          >
            {/* 角色名称标签 */}
            <div
              className={cls(
                "absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-sm",
                character.sid === 0 ? "text-blue-300" : "text-red-300"
              )}
              style={
                index % 2 === 0
                  ? {
                      top: "-200%",
                    }
                  : {
                      top: "130%",
                    }
              }
            >
              {character.name}
              {castingTime !== undefined && castingTime > 0 && (
                <span className="ml-1 text-white">
                  ({(castingTime / 1000).toFixed(1)}s)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
