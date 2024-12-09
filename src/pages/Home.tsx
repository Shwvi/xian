import Typewriter from "typewriter-effect";

const cultivationTexts = [
  "道可道，非常道。名可名，非常名。",
  "修仙之路，漫漫其修遠兮",
  "一念成魔，一念成佛",
  "天地不仁，以萬物為芻狗",
  "道法自然，順應天命",
  "凡塵俗世，皆為虛妄",
  "悟道修真，追求長生",
  "天地有正氣，雜然賦流形",
  "修真之路，步步驚心",
  "五行相生相剋，陰陽調和為道",
];

export default function Home() {
  return (
    <div className="fixed inset-0 bg-[#09090b] text-gray-200 touch-none select-none">
      {/* 頂部留白 */}
      <div className="h-[30vh]" />

      {/* 主要內容區 */}
      <div className="px-6">
        {/* 標題 */}
        <h1 className="text-3xl font-bold mb-16 text-center animate-fade-in">
          凡塵入世
        </h1>

        {/* 打字機效果區 */}
        <div className="min-h-[4em] text-center">
          <Typewriter
            options={{
              strings: cultivationTexts,
              autoStart: true,
              loop: true,
              delay: 100,
              deleteSpeed: 50,
              cursor: "｜",
              wrapperClassName: "text-lg text-gray-400 leading-relaxed",
              cursorClassName: "text-white-500",
            }}
          />
        </div>
      </div>

      {/* 底部提示 */}
      <div className="flex justify-center">
        <img src={"/weapon.png"} className="w-10 h-10 invert animate-spin" />
      </div>
    </div>
  );
}
