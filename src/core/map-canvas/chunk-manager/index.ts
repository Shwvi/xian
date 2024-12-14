import { IChunkGenerator, ChunkData, TerrainType } from "./types";

export class Chunk {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: ChunkData;

  constructor(
    public readonly x: number,
    public readonly y: number,
    data: ChunkData,
    size: number
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx = this.canvas.getContext("2d")!;
    this.data = data;
    this.render();
  }

  private render(): void {
    // 根据地形类型渲染不同的颜色
    switch (this.data.terrain) {
      case TerrainType.PLAIN:
        this.ctx.fillStyle = "#90EE90";
        break;
      case TerrainType.MOUNTAIN:
        this.ctx.fillStyle = "#A0522D";
        break;
      case TerrainType.WATER:
        this.ctx.fillStyle = "#87CEEB";
        break;
      case TerrainType.FOREST:
        this.ctx.fillStyle = "#228B22";
        break;
      default:
        this.ctx.fillStyle = "#FFFFFF";
    }
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public isWalkable(): boolean {
    return this.data.walkable;
  }
}

export class ChunkManager {
  public readonly CHUNK_SIZE = 32;
  private chunks: Map<string, Chunk> = new Map();

  constructor(private generator: IChunkGenerator) {}

  public getChunkAt(x: number, y: number): Chunk {
    const key = `${x},${y}`;
    if (!this.chunks.has(key)) {
      const chunkData = this.generator.generateChunk(x, y);
      this.chunks.set(key, new Chunk(x, y, chunkData, this.CHUNK_SIZE));
    }
    return this.chunks.get(key)!;
  }

  public walkableAt(x: number, y: number): boolean {
    return this.generator.walkableAt(x, y);
  }
}
