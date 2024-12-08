import { useTrail, animated } from "@react-spring/web";
import { IBattleAbleCharacter, ISkill } from "@/core/typing";
import cls from "classnames";
import { useMemo } from "react";
import React from "react";
import { getCoreStream } from "@/core/stream";
import { NormalEvent } from "@/core/stream";

interface SkillMenuProps {
  setMenuType: React.Dispatch<
    React.SetStateAction<"main" | "skills" | "items" | null>
  >;
  player: IBattleAbleCharacter | null;
}

function SkillMenu({ setMenuType, player }: SkillMenuProps) {
  const skills = useMemo(() => player?.skills || [], [player]);
  const trail = useTrail(skills.length, {
    from: { opacity: 0, x: 50 },
    to: { opacity: 1, x: 0 },
    config: { mass: 1, tension: 280, friction: 20 },
    reset: true,
  });

  const handleSkillSelect = async (skill: ISkill) => {
    getCoreStream().publish({
      type: NormalEvent.USER_SELECT_SKILL,
      payload: skill,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-start">
        <animated.button
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors mb-2"
          onClick={() => setMenuType("main")}
        >
          ← 返回
        </animated.button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory flex-1">
        {trail.map((style, index) => {
          const skill = skills[index];
          return (
            <animated.div
              key={skill.name}
              style={style}
              className={cls(
                "p-1 border rounded-lg shrink-0 w-[200px] snap-center",
                skill.cost > (player?.c_mp || 0)
                  ? "opacity-50 border-gray-700 bg-gray-900/50"
                  : "border-gray-600"
              )}
              onClick={() => {
                if (skill.cost <= (player?.c_mp || 0)) {
                  handleSkillSelect(skill);
                  setMenuType("main");
                }
              }}
            >
              <div className="text-left text-sm">
                <div className="font-bold text-gray-200">{skill.name}</div>
                <div className="text-sm text-gray-400">{skill.description}</div>
                <div className="text-sm text-gray-400">
                  消耗: {skill.cost} MP
                </div>
              </div>
            </animated.div>
          );
        })}
      </div>
    </div>
  );
}
const MemoSkillMenu = React.memo(SkillMenu);
export default MemoSkillMenu;
