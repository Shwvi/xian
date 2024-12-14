import { useTrail, animated } from "@react-spring/web";
import React from "react";

interface MainMenuProps {
  setMenuType: React.Dispatch<
    React.SetStateAction<"main" | "skills" | "items" | null>
  >;
}

function MainMenu({ setMenuType }: MainMenuProps) {
  const mainMenuSprings = useTrail(2, {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: { tension: 280, friction: 20 },
    reset: true,
  });

  return (
    <div className="h-full flex gap-4">
      {mainMenuSprings.map((springProps, index) => {
        const type = ["skills", "items"][index];
        return (
          <animated.div
            key={type}
            style={springProps}
            className="flex-1 p-2 transition-colors cursor-pointer"
            onClick={() => setMenuType(type as any)}
          >
            <div className="h-full flex items-center justify-center">
              <div className="font-bold text-5xl text-indigo-100">
                {type === "skills" ? "术" : "器"}
              </div>
            </div>
          </animated.div>
        );
      })}
    </div>
  );
}

const MemoMainMenu = React.memo(MainMenu);
export default MemoMainMenu;
