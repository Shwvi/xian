import { Point } from "../index";

export interface IChunkGenerator {
  generateChunk(x: number, y: number): ChunkData;
  walkableAt(x: number, y: number): boolean;
}

export interface ChunkData {
  terrain: TerrainType;
  walkable: boolean;
  // 可以根据需要添加更多属性
}

export enum TerrainType {
  PLAIN = "PLAIN",
  MOUNTAIN = "MOUNTAIN",
  WATER = "WATER",
  FOREST = "FOREST",
}
