import { IBattleAbleCharacter } from "@/core/typing";
import cls from "classnames";
import styles from "./index.module.less";
import { useEffect, useState } from "react";

interface Props {
  character: IBattleAbleCharacter | null;
  isActive: boolean;
  type: "enemy" | "player";
}

export default function BattleCharacterStatus({
  character,
  isActive,
  type,
}: Props) {
  const [hpPercent, setHpPercent] = useState(100);

  useEffect(() => {
    if (character) {
      setHpPercent((character.c_hp / character.t_hp) * 100);
    }
  }, [character?.c_hp]);

  const isEnemy = type === "enemy";

  return (
    <div
      className={cls(
        isEnemy
          ? "border border-red-800/50 bg-red-950/20"
          : "border border-blue-800/50 bg-blue-950/20",
        "p-2 rounded-lg opacity-50 h-full",
        isActive && styles.active
      )}
    >
      <h3
        className={
          isEnemy
            ? "text-lg font-bold text-red-200"
            : "text-lg font-bold text-blue-200"
        }
      >
        {character?.name}{" "}
        <span className="text-xs">
          ({character?.c_hp}/{character?.t_hp})
        </span>
      </h3>

      {/* HP Bar */}
      <div className="my-1">
        <div className="h-2 bg-gray-700 rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isEnemy ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
