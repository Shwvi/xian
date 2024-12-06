import { IAppendBattleLogEvent, LogType } from "@/core/stream";
import { memo, useRef, useEffect, useMemo, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import LogItem from "./LogItem";

interface BattleLogProps {
  logs: IAppendBattleLogEvent[];
}

interface GroupedLog {
  id: string;
  contents: {
    content: string;
    typeSpeed?: number;
  }[];
}

interface TypewriterState {
  groupIndex: number;
  contentIndex: number;
  charIndex: number;
}

const isEmptyGroup = (group: GroupedLog) => {
  if (group.contents.length === 0) return true;
  if (group.contents.every((s) => s.content === "")) return true;
  return false;
};

const BattleLog = memo(({ logs }: BattleLogProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [typewriterState, setTypewriterState] = useState<TypewriterState>({
    groupIndex: 0,
    contentIndex: 0,
    charIndex: 0,
  });
  const [displayTexts, setDisplayTexts] = useState<Map<string, string>>(
    new Map()
  );

  const groupedLogs = useMemo(() => {
    return logs.reduce<GroupedLog[]>((acc, log, index) => {
      if (log.type === LogType.GAP) {
        acc.push({
          id: `group-${index}`,
          contents: [],
        });
        return acc;
      }

      if (log.newParagraph || acc.length === 0) {
        acc.push({
          id: `group-${index}`,
          contents: [{ content: log.content, typeSpeed: log.typeSpeed }],
        });
      } else {
        acc[acc.length - 1].contents.push({
          content: log.content,
          typeSpeed: log.typeSpeed,
        });
      }

      return acc;
    }, []);
  }, [logs]);

  useEffect(() => {
    const currentGroup = groupedLogs[typewriterState.groupIndex];
    if (!currentGroup) return;

    const currentContent = currentGroup.contents[typewriterState.contentIndex];
    if (!currentContent) return;

    const typeSpeed = currentContent.typeSpeed || 50;
    const logId = `${currentGroup.id}-${typewriterState.contentIndex}`;

    const timer = setTimeout(() => {
      if (typewriterState.charIndex < currentContent.content.length) {
        setDisplayTexts((prev) => {
          const newMap = new Map(prev);
          newMap.set(
            logId,
            currentContent.content.slice(0, typewriterState.charIndex + 1)
          );
          return newMap;
        });
        setTypewriterState((prev) => ({
          ...prev,
          charIndex: prev.charIndex + 1,
        }));
      } else {
        // Move to next content or group
        const nextState = getNextTypewriterState(
          typewriterState,
          groupedLogs,
          currentGroup
        );
        setTypewriterState(nextState);
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [typewriterState, groupedLogs]);

  useEffect(() => {
    if (!virtuosoRef.current) return;
    const isTyping =
      typewriterState.groupIndex < groupedLogs.length &&
      typewriterState.charIndex > 0;
    if (isTyping) {
      virtuosoRef.current.scrollBy({ top: Number.MAX_SAFE_INTEGER });
    }
  }, [typewriterState, groupedLogs.length]);

  return (
    <div className="flex-1 border border-white rounded-lg p-4 mb-4 backdrop-blur">
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: "100%" }}
        totalCount={groupedLogs.length}
        alignToBottom
        initialTopMostItemIndex={groupedLogs.length - 1}
        itemContent={(index) => {
          const group = groupedLogs[index];
          if (isEmptyGroup(group)) return <div className="px-1 h-[1px]" />;
          return (
            <div key={group.id} className="mt-4">
              <div className="text-gray-300 px-3 rounded">
                <span className="px-1"></span>
                {group.contents.map((item, i) => {
                  const logId = `${group.id}-${i}`;
                  const isBoundary = i === group.contents.length - 1 || i === 0;
                  const isCurrentTyping =
                    typewriterState.groupIndex === index &&
                    typewriterState.contentIndex === i;
                  return (
                    <>
                      <LogItem
                        key={logId}
                        content={item.content}
                        displayText={displayTexts.get(logId) || ""}
                        isTyping={isCurrentTyping}
                      />
                      {!isBoundary && "，"}
                    </>
                  );
                })}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
});

function getNextTypewriterState(
  current: TypewriterState,
  groupedLogs: GroupedLog[],
  currentGroup: GroupedLog
): TypewriterState {
  if (current.contentIndex < currentGroup.contents.length - 1) {
    return {
      ...current,
      contentIndex: current.contentIndex + 1,
      charIndex: 0,
    };
  }

  if (current.groupIndex < groupedLogs.length - 1) {
    return {
      groupIndex: current.groupIndex + 1,
      contentIndex: 0,
      charIndex: 0,
    };
  }

  return current;
}

export default BattleLog;
