import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';

export interface TerrainType {
    type: 'WATER' | 'PLAINS' | 'HILLS' | 'MOUNTAINS';
    isWalkable: boolean;
    color: string;
}

export class TerrainGenerator {
    private noise: NoiseFunction2D;
    private readonly CHUNK_SIZE = 256; // 每个区块的大小
    private readonly SCALE = 0.005; // 噪声缩放因子

    private readonly TERRAIN_TYPES: TerrainType[] = [
        { type: 'WATER', isWalkable: true, color: '#0077be' },
        { type: 'PLAINS', isWalkable: true, color: '#90EE90' },
        { type: 'HILLS', isWalkable: true, color: '#808000' },
        { type: 'MOUNTAINS', isWalkable: false, color: '#808080' }
    ];

    constructor(seed: number = Math.random()) {
        this.noise = createNoise2D(() => seed);
    }

    public getTerrainAt(x: number, y: number): TerrainType {
        const elevation = this.getElevation(x, y);

        if (elevation < 0.3) return this.TERRAIN_TYPES[0]; // Water
        if (elevation < 0.5) return this.TERRAIN_TYPES[1]; // Plains
        if (elevation < 0.7) return this.TERRAIN_TYPES[2]; // Hills
        return this.TERRAIN_TYPES[3]; // Mountains
    }

    private getElevation(x: number, y: number): number {
        // 使用多层柏林噪声创建更自然的地形
        let elevation = 0;
        let amplitude = 1;
        let frequency = 1;

        for (let i = 0; i < 4; i++) {
            elevation += this.noise(x * this.SCALE * frequency, y * this.SCALE * frequency) * amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        // 归一化到 0-1 范围
        return (elevation + 1) / 2;
    }
} 