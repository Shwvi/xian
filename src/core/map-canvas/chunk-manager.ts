import { TerrainGenerator, TerrainType } from '../terrain-generator/terrain-generator';

export interface Chunk {
    x: number;
    y: number;
    terrain: TerrainType[][];
    canvas: OffscreenCanvas;
}

export class ChunkManager {
    private chunks: Map<string, Chunk> = new Map();
    public readonly CHUNK_SIZE = 512;
    private terrainGenerator: TerrainGenerator;
    private readonly CACHE_LIMIT = 1000;

    constructor() {
        this.terrainGenerator = new TerrainGenerator();
    }

    public getChunkAt(x: number, y: number): Chunk {
        const chunkX = Math.floor(x / this.CHUNK_SIZE);
        const chunkY = Math.floor(y / this.CHUNK_SIZE);
        const key = `${chunkX},${chunkY}`;

        if (!this.chunks.has(key)) {
            this.chunks.set(key, this.generateChunk(chunkX, chunkY));
            this.cleanupChunks();
        }

        return this.chunks.get(key)!;
    }

    private generateChunk(chunkX: number, chunkY: number): Chunk {
        const terrain: TerrainType[][] = [];
        const canvas = new OffscreenCanvas(this.CHUNK_SIZE, this.CHUNK_SIZE);
        const ctx = canvas.getContext('2d')!;
        
        for (let y = 0; y < this.CHUNK_SIZE; y++) {
            terrain[y] = [];
            for (let x = 0; x < this.CHUNK_SIZE; x++) {
                const worldX = chunkX * this.CHUNK_SIZE + x;
                const worldY = chunkY * this.CHUNK_SIZE + y;
                const terrainType = this.terrainGenerator.getTerrainAt(worldX, worldY);
                terrain[y][x] = terrainType;
                
                ctx.fillStyle = terrainType.color;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        return {
            x: chunkX,
            y: chunkY,
            terrain,
            canvas
        };
    }

    private cleanupChunks(): void {
        if (this.chunks.size > this.CACHE_LIMIT) {
            const oldestKey = this.chunks.keys().next().value;
            this.chunks.delete(oldestKey);
        }
    }
} 