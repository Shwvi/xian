import { IWorldMap } from "../../typing";
import { IChunkGenerator, ChunkData, TerrainType } from "./types";
import { Point } from "../index";

export class WorldMapGenerator implements IChunkGenerator {
  private readonly CHUNK_SIZE = 32;

  constructor(private worldMap: IWorldMap) {}

  generateChunk(chunkX: number, chunkY: number): ChunkData {
    // 将区块坐标转换为世界坐标
    const worldX = chunkX * this.CHUNK_SIZE;
    const worldY = chunkY * this.CHUNK_SIZE;

    // 检查区块是否在任何区域内
    for (const region of this.worldMap.regions) {
      if (this.isChunkInRegion(worldX, worldY, region)) {
        return {
          terrain: region.terrain,
          walkable: true, // 可以根据地形类型或其他条件决定是否可行走
        };
      }
    }

    // 默认为平原
    return {
      terrain: TerrainType.PLAIN,
      walkable: true,
    };
  }

  walkableAt(x: number, y: number): boolean {
    // 检查点是否在任何不可行走的区域内
    for (const region of this.worldMap.regions) {
      if (this.isPointInRegion({ x, y }, region)) {
        // 可以根据��形类型决定是否可行走
        return region.terrain !== TerrainType.WATER;
      }
    }
    return true;
  }

  private isChunkInRegion(
    worldX: number,
    worldY: number,
    region: any
  ): boolean {
    // 检查区块的四个角点是否有任何一个在区域内
    const points = [
      { x: worldX, y: worldY },
      { x: worldX + this.CHUNK_SIZE, y: worldY },
      { x: worldX, y: worldY + this.CHUNK_SIZE },
      { x: worldX + this.CHUNK_SIZE, y: worldY + this.CHUNK_SIZE },
    ];

    return points.some((point) => this.isPointInRegion(point, region));
  }

  private isPointInRegion(point: Point, region: any): boolean {
    if (region.shape.type === "polygon") {
      return this.isPointInPolygon(point, region.shape.points);
    } else if (region.shape.type === "circle") {
      return this.isPointInCircle(
        point,
        region.shape.points.center,
        region.shape.points.radius
      );
    }
    return false;
  }

  private isPointInPolygon(point: Point, vertices: Point[]): boolean {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x,
        yi = vertices[i].y;
      const xj = vertices[j].x,
        yj = vertices[j].y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private isPointInCircle(
    point: Point,
    center: Point,
    radius: number
  ): boolean {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy <= radius * radius;
  }
}
