import { useNavigate } from "react-router-dom";

export default function Death() {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur">
        <h2 className="text-2xl mb-4">寿终正寝</h2>
        <p className="mb-6">你的修仙之路到此为止...</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-primary rounded-full text-white"
        >
          重新开始
        </button>
      </div>
    </div>
  );
}
