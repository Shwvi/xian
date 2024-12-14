import { createNoise2D, type NoiseFunction2D } from "simplex-noise";

export enum TerrainTypeEnum {
  WATER = 0,
  PLAINS = 1,
  HILLS = 2,
  MOUNTAINS = 3,
}

export type FullTerrainType = {
  type: TerrainTypeEnum;
  isWalkable: boolean;
  color: string;
};

export type TerrainType = number;

const isWalkableType = (type: TerrainTypeEnum) =>
  type !== TerrainTypeEnum.MOUNTAINS;

export const encodeTerrainByType = (type: TerrainTypeEnum): TerrainType => {
  let encodedType = 0;
  encodedType |= isWalkableType(type) ? 1 << 0 : 0;
  encodedType |= type << 1;
  return encodedType;
};

export const decodeTerrainByType = (type: TerrainType): FullTerrainType => {
  const isWalkable = (type & 1) === 1;
  const terrainType = type >> 1;
  return {
    type: terrainType,
    isWalkable,
    color:
      terrainType === TerrainTypeEnum.MOUNTAINS
        ? "#808080"
        : terrainType === TerrainTypeEnum.HILLS
        ? "#808000"
        : terrainType === TerrainTypeEnum.PLAINS
        ? "#90EE90"
        : "#0077be",
  };
};

export class TerrainGenerator {
  private noise: NoiseFunction2D;
  private readonly SCALE = 0.005; // 噪声缩放因子

  constructor(seed: number = Math.random()) {
    this.noise = createNoise2D(() => seed);
  }

  public getTerrainAt(x: number, y: number): TerrainType {
    const elevation = this.getElevation(x, y);

    if (elevation < 0.3) return encodeTerrainByType(TerrainTypeEnum.WATER); // Water
    if (elevation < 0.5) return encodeTerrainByType(TerrainTypeEnum.PLAINS); // Plains
    if (elevation < 0.7) return encodeTerrainByType(TerrainTypeEnum.HILLS); // Hills
    return encodeTerrainByType(TerrainTypeEnum.MOUNTAINS); // Mountains
  }

  private getElevation(x: number, y: number): number {
    // 使用多层柏林噪声创建更自然的地形
    let elevation = 0;
    let amplitude = 1;
    let frequency = 1;

    for (let i = 0; i < 4; i++) {
      elevation +=
        this.noise(x * this.SCALE * frequency, y * this.SCALE * frequency) *
        amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    // 归一化到 0-1 范围
    return (elevation + 1) / 2;
  }
}
