import cls from "classnames";

export default function Loading({
  className,
  text,
}: {
  className?: string;
  text?: string;
}) {
  return (
    <div className={cls("flex items-center justify-center gap-2", className)}>
      <img src="/weapon.png" className="w-8 h-8 invert animate-spin" />
      <div className="text-gray-300 text-xs opacity-50">
        {text || "加载中..."}
      </div>
    </div>
  );
}
