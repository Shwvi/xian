import { useEffect, useState } from "react";
import CultivationMap from "@/components/map";


export default function Scene() {
  const [movementStatus, setMovementStatus] = useState<{
    isMoving: boolean;
    currentEvent?: any;
  }>({ isMoving: false });

  return (
    <div className="h-full w-full flex flex-col gap-4">
      <div className="h-1/4 w-full overflow-hidden rounded-md">
        <CultivationMap />
      </div>

      {movementStatus.currentEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h3>遭遇事件！</h3>
            <p>{movementStatus.currentEvent.description}</p>
            <button onClick={() => setMovementStatus({ isMoving: true })}>
              继续前进
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
