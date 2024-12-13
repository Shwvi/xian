import { CanvasMap } from '@/core/map-canvas';
import React, { useEffect, useRef } from 'react';

const GameMap: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameInstanceRef = useRef<CanvasMap | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        canvasRef.current.width = canvasRef.current.clientWidth;
        canvasRef.current.height = canvasRef.current.clientHeight;

        // 初始化游戏画布
        gameInstanceRef.current = new CanvasMap(canvasRef.current);

        return () => {
            gameInstanceRef.current?.destroy();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                touchAction: 'none',
                width: '100%',
                height: '100%'
            }}
        />
    );
};

export default GameMap;
