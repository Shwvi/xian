import { useSpring, animated, useTrail } from "@react-spring/web";
import { IBattleAbleCharacter, ISkill } from "@/core/typing";
import cls from "classnames";
import { useMemo } from "react";
import MainMenu from "./battle/MainMenu";
import SkillMenu from "./battle/SkillMenu";

interface BattleMenuProps {
  menuType: "main" | "skills" | "items" | null;
  setMenuType: React.Dispatch<
    React.SetStateAction<"main" | "skills" | "items" | null>
  >;
  isPlayerTurn: boolean;
  player: IBattleAbleCharacter | null;
}

export default function BattleMenu({
  menuType,
  setMenuType,
  isPlayerTurn,
  player,
}: BattleMenuProps) {
  // Keep only the main menu animation
  const menuAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: {
      opacity: 1,
      transform: "translateY(0px)",
    },
    config: { tension: 280, friction: 20 },
  });

  return (
    <animated.div style={menuAnimation} className="h-1/6 relative">
      {!isPlayerTurn ? (
        <div className="text-center text-gray-500 italic h-full flex items-center justify-center">
          等待行动中...
        </div>
      ) : (
        <>
          {menuType === "main" && <MainMenu setMenuType={setMenuType} />}
          {menuType === "skills" && (
            <SkillMenu setMenuType={setMenuType} player={player} />
          )}
          {menuType === "items" && (
            <div className="text-center text-gray-400">
              <div>道具功能开发中...</div>
              <button
                className="mt-2 text-sm"
                onClick={() => setMenuType("main")}
              >
                ← 返回
              </button>
            </div>
          )}
        </>
      )}
    </animated.div>
  );
}
