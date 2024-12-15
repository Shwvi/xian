import { IWorldData } from "@/core/typing";
import { useState } from "react";
import cls from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import { sceneManager } from "@/core/scene/SceneManager";

export const WorldAction = ({
  world,
  children,
}: {
  world: IWorldData;
  children: React.ReactNode;
}) => {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleClick = () => {
    // if (world.actions && world.actions.length > 0) {
    setShowOverlay(true);
    // }
  };

  return (
    <>
      <motion.div whileTap={{ scale: 0.95 }} onClick={handleClick}>
        {children}
      </motion.div>

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => setShowOverlay(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute left-4 right-4 bottom-5 bg-gray-900/90 rounded-lg overflow-hidden h-min"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-gray-100">
                  {world.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {world.description}
                </p>

                <div className="space-y-3 mt-6 flex-1 overflow-auto">
                  {world.actions?.map((action, index) => (
                    <motion.button
                      key={index}
                      whileTap={{ scale: 0.98 }}
                      className={cls(
                        "w-full p-4 rounded-lg text-left transition-colors relative overflow-hidden",
                        "bg-gray-800/50 border border-gray-700/50",
                        "active:bg-gray-700/30"
                      )}
                      onClick={() => {
                        sceneManager.handleAction(action);
                        setShowOverlay(false);
                      }}
                    >
                      {/* 悬浮时的光效 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />

                      {action.type === "move" && (
                        <div className="flex items-center gap-3">
                          <span className="text-blue-400 text-lg">→</span>
                          <span className="text-gray-200">
                            {action.description}
                          </span>
                        </div>
                      )}
                      {action.type === "character" && (
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-400 text-lg">!</span>
                          <span className="text-gray-200">对话</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="pt-4 mt-4 border-t border-gray-700/50">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowOverlay(false)}
                    className={cls(
                      "w-full p-4 rounded-lg text-center transition-colors",
                      "bg-gray-800/50 border border-gray-700/50",
                      "hover:bg-gray-700/30 active:bg-gray-600/30",
                      "text-gray-400 hover:text-gray-300"
                    )}
                  >
                    取消
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
