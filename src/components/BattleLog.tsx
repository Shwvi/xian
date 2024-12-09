import { IAppendBattleLogEvent } from "@/core/stream";
import { memo, useRef, useEffect, useMemo } from "react";
import cls from "classnames";

interface BattleLogProps {
  logs: IAppendBattleLogEvent[];
}

type TokenType = "text" | "red" | "green" | "blue" | "yellow" | "bisque"; // 可以继续扩展颜色

interface Token {
  type: TokenType;
  content: string | Token[];
}

// 解析文本为 tokens
function parseContent(content: string): Token[] {
  const tokens: Token[] = [];
  let currentToken = "";
  const stack: Token[] = [];
  let current = tokens;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === "(") {
      if (currentToken) {
        current.push({ type: "text", content: currentToken });
        currentToken = "";
      }

      // 查找颜色标识，设置固定搜索范围
      const searchLimit = Math.min(i + 20, content.length);
      const colorEnd = content.indexOf(")", i);

      // 如果在搜索范围内没找到结束括号，直接结束解析
      if (colorEnd === -1 || colorEnd > searchLimit) {
        break;
      }

      const colorMatch = content
        .slice(i + 1, colorEnd)
        .match(/^(red|green|blue|yellow|bisque)/);

      if (colorMatch) {
        const newToken: Token = {
          type: colorMatch[1] as TokenType,
          content: [],
        };
        current.push(newToken);
        stack.push(newToken);
        current = newToken.content as Token[];
        i += colorMatch[0].length;
      } else {
        // 如果没有匹配到颜色，直接结束解析
        break;
      }
      continue;
    }

    if (char === ")" && stack.length > 0) {
      if (currentToken) {
        current.push({ type: "text", content: currentToken });
        currentToken = "";
      }
      stack.pop();
      current =
        stack.length > 0
          ? (stack[stack.length - 1].content as Token[])
          : tokens;
      continue;
    }

    currentToken += char;
  }

  if (currentToken) {
    current.push({ type: "text", content: currentToken });
  }

  return tokens;
}

// 渲染 Token 组件
const TokenComponent = memo(({ token }: { token: Token }) => {
  const style = useMemo(() => {
    switch (token.type) {
      case "red":
        return { color: "#ef4444" };
      case "green":
        return { color: "#22c55e" };
      case "blue":
        return { color: "#3b82f6" };
      case "yellow":
        return { color: "#eab308" };
      case "bisque":
        return { color: "bisque" };
      default:
        return {};
    }
  }, [token.type]);

  if (Array.isArray(token.content)) {
    return (
      <span style={style}>
        {token.content.map((t, i) => (
          <TokenComponent key={i} token={t} />
        ))}
      </span>
    );
  }

  return <span style={style}>{token.content}</span>;
});

const RichRender = memo(
  ({ content, isLast }: { content: string; isLast: boolean }) => {
    const tokens = useMemo(() => parseContent(content), [content]);

    return (
      <div className="mt-4">
        <div
          className={cls(
            "px-3 rounded transition-all duration-500 text-gray-300",
            isLast ? "opacity-100" : "opacity-30"
          )}
        >
          <span className="px-1"></span>
          {tokens.map((token, i) => (
            <TokenComponent key={i} token={token} />
          ))}
        </div>
      </div>
    );
  }
);

const BattleLog = memo(({ logs }: BattleLogProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollContainerRef.current) return;

    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [logs]);

  return (
    <div className="flex-1 rounded-lg my-4 overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto flex flex-col scroll-smooth"
      >
        <div className="flex-1"></div>
        {logs.map((log, index) => {
          const isLast = index === logs.length - 1;
          if (log.newParagraph)
            return <div key={index} className="px-1 h-[1px]" />;
          return (
            <RichRender key={index} content={log.content} isLast={isLast} />
          );
        })}
      </div>
    </div>
  );
});

export default BattleLog;
