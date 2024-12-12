import Konva from "konva";
import { IWorldMap, TerrainType, IMapRegion } from "@/core/typing";

export class SceneMapRenderer {
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private container: HTMLDivElement;
  private tileSize: number = 0;
  private readonly CELL_SIZE = 10; // 可以根据实际地图大小调整
  private spatialHash: Map<number, TerrainType> = new Map();
  private readonly REAL_WORLD_SCALE = 100; // 1 unit = 100 meters

  // Define terrain colors
  private readonly TERRAIN_COLORS = {
    [TerrainType.PLAIN]: 0x90a955,
    [TerrainType.MOUNTAIN]: 0x6c584c,
    [TerrainType.FOREST]: 0x344e41,
    [TerrainType.DESERT]: 0xdda15e,
    [TerrainType.WATER]: 0x219ebc,
    [TerrainType.SACRED]: 0xf2cc8f,
    [TerrainType.FORBIDDEN]: 0x9b2226,
  };

  constructor(container: HTMLDivElement) {
    this.container = container as HTMLDivElement;
    if (!this.container) {
      throw new Error(`Container not found`);
    }

    this.stage = new Konva.Stage({
      container: container,
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  private hexToString(hex: number): string {
    return `#${hex.toString(16).padStart(6, "0")}`;
  }

  private calculateTileSize(map: IWorldMap): number {
    // Find the bounds of all shapes
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    map.regions.forEach((region) => {
      if (region.shape.type === "polygon") {
        (region.shape.points as { x: number; y: number }[]).forEach((point) => {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        });
      } else {
        const circle = region.shape.points as {
          center: { x: number; y: number };
          radius: number;
        };
        minX = Math.min(minX, circle.center.x - circle.radius);
        minY = Math.min(minY, circle.center.y - circle.radius);
        maxX = Math.max(maxX, circle.center.x + circle.radius);
        maxY = Math.max(maxY, circle.center.y + circle.radius);
      }
    });

    const mapWidth = (maxX - minX) * this.REAL_WORLD_SCALE;
    const mapHeight = (maxY - minY) * this.REAL_WORLD_SCALE;

    const scaleX = this.container.clientWidth / mapWidth;
    const scaleY = this.container.clientHeight / mapHeight;

    return Math.min(scaleX, scaleY) * 0.8;
  }

  private hashCoord(x: number, y: number): number {
    // 使用 Cantor 配对函数生成唯一的哈希值
    const px = Math.floor(x / this.CELL_SIZE);
    const py = Math.floor(y / this.CELL_SIZE);
    return ((px + py) * (px + py + 1)) / 2 + py;
  }

  private isPointInShape(
    point: { x: number; y: number },
    region: IMapRegion
  ): boolean {
    if (region.shape.type === "circle") {
      const circle = region.shape.points as {
        center: { x: number; y: number };
        radius: number;
      };
      const dx = point.x - circle.center.x;
      const dy = point.y - circle.center.y;
      return dx * dx + dy * dy <= circle.radius * circle.radius;
    } else {
      const points = region.shape.points as { x: number; y: number }[];
      let inside = false;

      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x,
          yi = points[i].y;
        const xj = points[j].x,
          yj = points[j].y;

        const intersect =
          yi > point.y !== yj > point.y &&
          point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }

      return inside;
    }
  }

  private getShapeBounds(region: IMapRegion): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    if (region.shape.type === "circle") {
      const circle = region.shape.points as {
        center: { x: number; y: number };
        radius: number;
      };
      return {
        minX: circle.center.x - circle.radius,
        minY: circle.center.y - circle.radius,
        maxX: circle.center.x + circle.radius,
        maxY: circle.center.y + circle.radius,
      };
    } else {
      const points = region.shape.points as { x: number; y: number }[];
      return points.reduce(
        (bounds, point) => ({
          minX: Math.min(bounds.minX, point.x),
          minY: Math.min(bounds.minY, point.y),
          maxX: Math.max(bounds.maxX, point.x),
          maxY: Math.max(bounds.maxY, point.y),
        }),
        {
          minX: Infinity,
          minY: Infinity,
          maxX: -Infinity,
          maxY: -Infinity,
        }
      );
    }
  }

  private initSpatialHash(map: IWorldMap): void {
    this.spatialHash.clear();

    map.regions.forEach((region) => {
      const bounds = this.getShapeBounds(region);

      // 遍历边界框内的所有网格
      const startCellX = Math.floor(bounds.minX / this.CELL_SIZE);
      const endCellX = Math.ceil(bounds.maxX / this.CELL_SIZE);
      const startCellY = Math.floor(bounds.minY / this.CELL_SIZE);
      const endCellY = Math.ceil(bounds.maxY / this.CELL_SIZE);

      for (let x = startCellX; x <= endCellX; x++) {
        for (let y = startCellY; y <= endCellY; y++) {
          // 检查网格中心点是否在形状内
          const cellCenterX = (x + 0.5) * this.CELL_SIZE;
          const cellCenterY = (y + 0.5) * this.CELL_SIZE;

          if (this.isPointInShape({ x: cellCenterX, y: cellCenterY }, region)) {
            const hash = this.hashCoord(x * this.CELL_SIZE, y * this.CELL_SIZE);
            this.spatialHash.set(hash, region.terrain);
          }
        }
      }
    });
  }

  public getTerrainAtPosition(x: number, y: number): TerrainType | null {
    const hash = this.hashCoord(x, y);
    return this.spatialHash.get(hash) ?? null;
  }

  private getVisibleCells(viewportBounds: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }): Set<number> {
    const visibleHashes = new Set<number>();

    // Convert viewport bounds to cell coordinates
    const startCellX = Math.floor(viewportBounds.left / this.CELL_SIZE);
    const endCellX = Math.ceil(viewportBounds.right / this.CELL_SIZE);
    const startCellY = Math.floor(viewportBounds.top / this.CELL_SIZE);
    const endCellY = Math.ceil(viewportBounds.bottom / this.CELL_SIZE);

    // Collect all cell hashes that are within the viewport
    for (let x = startCellX; x <= endCellX; x++) {
      for (let y = startCellY; y <= endCellY; y++) {
        const hash = this.hashCoord(x * this.CELL_SIZE, y * this.CELL_SIZE);
        if (this.spatialHash.has(hash)) {
          visibleHashes.add(hash);
        }
      }
    }

    return visibleHashes;
  }

  private drawRegion(region: IMapRegion): Konva.Shape {
    if (region.shape.type === "polygon") {
      const points = (region.shape.points as { x: number; y: number }[])
        .map((p) => [
          p.x * this.tileSize * this.REAL_WORLD_SCALE,
          p.y * this.tileSize * this.REAL_WORLD_SCALE,
        ])
        .flat();

      return new Konva.Line({
        points: points,
        closed: true,
        fill: this.hexToString(this.TERRAIN_COLORS[region.terrain]),
        stroke: "#000",
        strokeWidth: 1,
        opacity: 0.8,
      });
    } else {
      const circle = region.shape.points as {
        center: { x: number; y: number };
        radius: number;
      };
      return new Konva.Circle({
        x: circle.center.x * this.tileSize * this.REAL_WORLD_SCALE,
        y: circle.center.y * this.tileSize * this.REAL_WORLD_SCALE,
        radius: circle.radius * this.tileSize * this.REAL_WORLD_SCALE,
        fill: this.hexToString(this.TERRAIN_COLORS[region.terrain]),
        stroke: "#000",
        strokeWidth: 1,
        opacity: 0.8,
      });
    }
  }

  private getCenterPoint(region: IMapRegion): { x: number; y: number } {
    if (region.shape.type === "circle") {
      const circle = region.shape.points as {
        center: { x: number; y: number };
        radius: number;
      };
      return circle.center;
    } else {
      const points = region.shape.points as { x: number; y: number }[];
      // Calculate center as average of all points
      const center = points.reduce(
        (acc, point) => ({
          x: acc.x + point.x / points.length,
          y: acc.y + point.y / points.length,
        }),
        { x: 0, y: 0 }
      );
      return center;
    }
  }

  public render(
    map: IWorldMap,
    playerPosition: { x: number; y: number },
    onMove?: (x: number, y: number) => void
  ): void {
    this.initSpatialHash(map);
    this.tileSize = this.calculateTileSize(map);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.stage.width(width);
    this.stage.height(height);
    this.layer.destroyChildren();

    // Calculate viewport boundaries
    const offsetX = width / 2 - playerPosition.x * this.tileSize;
    const offsetY = height / 2 - playerPosition.y * this.tileSize;

    const viewportBounds = {
      left: -offsetX / this.tileSize,
      top: -offsetY / this.tileSize,
      right: (-offsetX + width) / this.tileSize,
      bottom: (-offsetY + height) / this.tileSize,
    };

    // Get visible cells using spatial hash
    const visibleCells = this.getVisibleCells(viewportBounds);

    // Only render regions that are in visible cells
    map.regions.forEach((region) => {
      const center = this.getCenterPoint(region);
      const hash = this.hashCoord(center.x, center.y);
      // if (!visibleCells.has(hash)) {
      //   return; // Skip regions outside visible cells
      // }

      const rect = this.drawRegion(region);

      if (onMove) {
        rect.on("click tap", () => {
          const center = this.getCenterPoint(region);
          onMove(center.x, center.y);
        });
      }

      this.layer.add(rect);
    });

    // Render player (always visible in center)
    const player = new Konva.Circle({
      x: playerPosition.x * this.tileSize,
      y: playerPosition.y * this.tileSize,
      radius: 10,
      fill: "#fff",
      stroke: "#000",
      strokeWidth: 2,
    });

    this.layer.add(player);
    this.layer.position({ x: offsetX, y: offsetY });
    this.layer.draw();

    console.log("Rendering map with:", {
      tileSize: this.tileSize,
      playerPosition,
      mapRegions: map.regions.length,
      viewportBounds,
      visibleCells: visibleCells.size,
    });
  }

  public destroy(): void {
    this.stage.destroy();
  }
}
