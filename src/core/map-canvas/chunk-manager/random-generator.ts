import { IChunkGenerator, ChunkData, TerrainType } from "./types";

export class RandomChunkGenerator implements IChunkGenerator {
  private readonly WALKABLE_CHANCE = 0.8;

  generateChunk(x: number, y: number): ChunkData {
    const walkable = Math.random() < this.WALKABLE_CHANCE;
    const terrainTypes = Object.values(TerrainType);
    const terrain =
      terrainTypes[Math.floor(Math.random() * terrainTypes.length)];

    return {
      terrain,
      walkable,
    };
  }

  walkableAt(x: number, y: number): boolean {
    // 使用确定性随机，这样相同坐标总是返回相同结果
    const seed = x * 10000 + y;
    return this.seededRandom(seed) < this.WALKABLE_CHANCE;
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
}
