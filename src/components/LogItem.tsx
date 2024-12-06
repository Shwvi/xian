import { memo } from "react";

interface LogItemProps {
  content: string;
  displayText: string;
  isTyping: boolean;
}

const LogItem = memo(({ content, displayText, isTyping }: LogItemProps) => {
  return (
    <span>
      {displayText}
      {isTyping && <span className="animate-pulse">|</span>}
    </span>
  );
});

export default LogItem;
