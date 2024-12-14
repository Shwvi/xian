import { IWorldMap } from "@/core/typing";
import { mockWorldMap } from "@/data/worldMap";

interface Position {
  x: number;
  y: number;
}

export class OverviewMap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private worldMap: IWorldMap;
  private playerPosition: Position = { x: 400, y: 300 }; // 初始位置在地图中心
  private moveSpeed = 5;
  private scale: number = 1;
  private minScale: number = 0.5;
  private maxScale: number = 2;

  constructor(canvas: HTMLCanvasElement, worldMap: IWorldMap = mockWorldMap) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.worldMap = worldMap;
    this.setupControls();
    this.render();
  }

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = this.scale * delta;

    if (newScale >= this.minScale && newScale <= this.maxScale) {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      this.scale = newScale;
      this.render();
    }
  };

  private handleKeydown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        this.movePlayer(0, -this.moveSpeed);
        break;
      case "ArrowDown":
        this.movePlayer(0, this.moveSpeed);
        break;
      case "ArrowLeft":
        this.movePlayer(-this.moveSpeed, 0);
        break;
      case "ArrowRight":
        this.movePlayer(this.moveSpeed, 0);
        break;
    }
  };

  private setupControls() {
    this.canvas.addEventListener("wheel", this.handleWheel);
    window.addEventListener("keydown", this.handleKeydown);
  }

  private movePlayer(dx: number, dy: number) {
    this.playerPosition.x += dx;
    this.playerPosition.y += dy;

    this.checkRegionEntry();
    this.render();
  }

  private checkRegionEntry() {
    const actualX = this.playerPosition.x;
    const actualY = this.playerPosition.y;

    this.worldMap.regions.forEach((region) => {
      if (this.isPointInRegion(actualX, actualY, region)) {
        // this.events.emit("regionEnter", region);
      }
    });
  }

  private isPointInRegion(x: number, y: number, region: any): boolean {
    if (region.shape.type === "circle") {
      const center = region.shape.points.center;
      const dx = x - center.x;
      const dy = y - center.y;
      return Math.sqrt(dx * dx + dy * dy) <= region.shape.points.radius;
    } else if (region.shape.type === "polygon") {
      return this.isPointInPolygon(x, y, region.shape.points);
    }
    return false;
  }

  private isPointInPolygon(x: number, y: number, points: Position[]): boolean {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x,
        yi = points[i].y;
      const xj = points[j].x,
        yj = points[j].y;

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();

    // 添加背景
    this.drawBackground();

    this.ctx.scale(this.scale, this.scale);

    const centerX = this.canvas.width / (2 * this.scale);
    const centerY = this.canvas.height / (2 * this.scale);
    const viewOffsetX = centerX - this.playerPosition.x;
    const viewOffsetY = centerY - this.playerPosition.y;

    this.worldMap.regions.forEach((region) => {
      this.ctx.beginPath();
      this.ctx.fillStyle = this.getTerrainColor(region.terrain);

      if (region.shape.type === "circle") {
        const center = region.shape.points.center;
        this.ctx.arc(
          center.x + viewOffsetX,
          center.y + viewOffsetY,
          region.shape.points.radius,
          0,
          Math.PI * 2
        );
      } else if (region.shape.type === "polygon") {
        const points = region.shape.points;
        this.ctx.moveTo(points[0].x + viewOffsetX, points[0].y + viewOffsetY);
        for (let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i].x + viewOffsetX, points[i].y + viewOffsetY);
        }
        this.ctx.closePath();
      }

      this.ctx.fill();
      this.ctx.stroke();
    });

    this.ctx.beginPath();
    this.ctx.fillStyle = "red";

    const playerSize = 15;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - playerSize);
    this.ctx.lineTo(centerX - playerSize / 2, centerY + playerSize / 2);
    this.ctx.lineTo(centerX + playerSize / 2, centerY + playerSize / 2);
    this.ctx.closePath();

    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  private drawBackground() {
    // 创建渐变背景
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height)
    );

    // 使用带有仙境感觉的柔和颜色
    gradient.addColorStop(0, "#f0f8ff"); // 淡淡的天蓝色
    gradient.addColorStop(0.5, "#e6e6fa"); // 淡紫色
    gradient.addColorStop(1, "#fff0f5"); // 淡粉色

    // 填充背景
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 添加云纹效果
    this.drawClouds();
  }

  private drawClouds() {
    const time = Date.now() / 3000; // 用于制造缓慢移动效果

    this.ctx.save();
    this.ctx.globalAlpha = 0.1; // 设置云的透明度

    for (let i = 0; i < 5; i++) {
      const x =
        (Math.sin(time + i) * this.canvas.width) / 4 + this.canvas.width / 2;
      const y =
        (Math.cos(time + i) * this.canvas.height) / 4 + this.canvas.height / 2;

      this.ctx.beginPath();
      this.ctx.fillStyle = "#ffffff";

      // 绘制云朵形状
      this.ctx.arc(x, y, 40, 0, Math.PI * 2);
      this.ctx.arc(x + 30, y - 10, 35, 0, Math.PI * 2);
      this.ctx.arc(x + 60, y, 40, 0, Math.PI * 2);
      this.ctx.arc(x + 30, y + 10, 35, 0, Math.PI * 2);

      this.ctx.fill();
    }

    this.ctx.restore();
  }

  private getTerrainColor(terrain: string): string {
    switch (terrain) {
      case "MOUNTAIN":
        return "rgba(139, 69, 19, 0.8)"; // 略微透明的山地颜色
      case "WATER":
        return "rgba(65, 105, 225, 0.7)"; // 略微透明的水域颜色
      case "FOREST":
        return "rgba(34, 139, 34, 0.8)"; // 略微透明的森林颜色
      default:
        return "rgba(128, 128, 128, 0.7)";
    }
  }

  public destroy() {
    // Remove wheel event listener from canvas
    this.canvas.removeEventListener("wheel", this.handleWheel);

    // Remove keydown event listener from window
    window.removeEventListener("keydown", this.handleKeydown);

    // Remove all event listeners from the EventEmitter
    // this.events.removeAllListeners();

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
