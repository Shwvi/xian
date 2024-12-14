import { mockWorldMap } from "@/data/worldMap";
import { Chunk, ChunkManager } from "./chunk-manager";
import { PathFinder } from "./pathfinding";
import { WorldMapGenerator } from "./chunk-manager/world-map-generator";
import { RandomChunkGenerator } from "./chunk-manager/random-generator";

export interface Point {
  x: number;
  y: number;
}

export interface GameState {
  playerPosition: Point;
  targetPosition: Point | null;
}

export class CanvasMap {
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private lastFrameTime: number = 0;
  private readonly PLAYER_SPEED = 1; // 像素/帧
  private chunkManager: ChunkManager;
  private readonly RENDER_BUFFER = 5; // 渲染缓冲区
  private lastRenderPosition: Point = { x: 0, y: 0 };
  private pathFinder: PathFinder;
  private currentPath: Point[] = [];
  private pathIndex: number = 0;
  private scale: number = 1;
  private scaleChanged: boolean = false;
  private readonly MIN_SCALE = 0.5;
  private readonly MAX_SCALE = 2;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;

    // 初始化游戏状态
    this.gameState = {
      playerPosition: { x: 0, y: 0 },
      targetPosition: null,
    };

    // 启动游戏循环
    this.startGameLoop();

    // 加载上次保存的状态
    this.loadGameState();

    this.chunkManager = new ChunkManager(new WorldMapGenerator(mockWorldMap));
    this.pathFinder = new PathFinder((x, y) => {
      return this.chunkManager.walkableAt(x, y);
    });

    // 绑定点击事件
    this.canvas.addEventListener("click", this.handleClick.bind(this));
    // 添加滚轮事件监听
    this.canvas.addEventListener("wheel", this.handleWheel.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // 考虑缩放因素转换点击坐标
    const worldX =
      (clickX - this.canvas.width / 2) / this.scale +
      this.gameState.playerPosition.x;
    const worldY =
      (clickY - this.canvas.height / 2) / this.scale +
      this.gameState.playerPosition.y;

    // 计算新路径
    this.currentPath = this.pathFinder.findPath(this.gameState.playerPosition, {
      x: worldX,
      y: worldY,
    });
    this.pathIndex = 0;

    if (this.currentPath.length > 0) {
      this.gameState.targetPosition = this.currentPath[0];
    }
  }

  private startGameLoop(): void {
    const loop = (currentTime: number) => {
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = currentTime;
      }

      const deltaTime = (currentTime - this.lastFrameTime) / 1000;
      this.update(deltaTime);
      this.render();

      this.lastFrameTime = currentTime;
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  private update(deltaTime: number): void {
    if (this.gameState.targetPosition && this.currentPath.length > 0) {
      const currentTargetPosition = this.currentPath[this.pathIndex];
      // 计算移动方向
      const dx = currentTargetPosition.x - this.gameState.playerPosition.x;
      const dy = currentTargetPosition.y - this.gameState.playerPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 1) {
        const moveX = (dx / distance) * this.PLAYER_SPEED;
        const moveY = (dy / distance) * this.PLAYER_SPEED;

        this.gameState.playerPosition.x += moveX;
        this.gameState.playerPosition.y += moveY;

        this.saveGameState();
      } else {
        // 到达当前路径点
        this.pathIndex++;
        if (this.pathIndex < this.currentPath.length) {
          this.gameState.targetPosition = this.currentPath[this.pathIndex];
        } else {
          this.gameState.targetPosition = null;
          this.currentPath = [];
        }
      }
    }
  }

  private render(): void {
    // 只有当玩家移动超过一定距离时才重新渲染
    const dx = this.gameState.playerPosition.x - this.lastRenderPosition.x;
    const dy = this.gameState.playerPosition.y - this.lastRenderPosition.y;
    const shouldRerender = Math.sqrt(dx * dx + dy * dy) > this.RENDER_BUFFER;

    if (!shouldRerender && !this.scaleChanged) {
      // 只重绘玩家
      this.renderPlayer();
      return;
    }

    this.scaleChanged = false;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新最后渲染位置
    this.lastRenderPosition = { ...this.gameState.playerPosition };

    // 渲染可见区块
    const visibleChunks = this.getVisibleChunks();
    for (const chunk of visibleChunks) {
      this.renderChunk(chunk);
    }

    this.renderPlayer();

    // 绘制路径
    if (this.currentPath.length > 0) {
      this.ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      const offsetX = this.canvas.width / 2 - this.gameState.playerPosition.x;
      const offsetY = this.canvas.height / 2 - this.gameState.playerPosition.y;

      this.ctx.moveTo(
        this.gameState.playerPosition.x + offsetX,
        this.gameState.playerPosition.y + offsetY
      );

      for (const point of this.currentPath) {
        this.ctx.lineTo(point.x + offsetX, point.y + offsetY);
      }

      this.ctx.stroke();
    }
  }

  private renderChunk(chunk: Chunk): void {
    const offsetX =
      this.canvas.width / 2 - this.gameState.playerPosition.x * this.scale;
    const offsetY =
      this.canvas.height / 2 - this.gameState.playerPosition.y * this.scale;
    const screenX =
      chunk.x * this.chunkManager.CHUNK_SIZE * this.scale + offsetX;
    const screenY =
      chunk.y * this.chunkManager.CHUNK_SIZE * this.scale + offsetY;

    // 应用缩放绘制区块
    this.ctx.drawImage(
      chunk.canvas,
      screenX,
      screenY,
      this.chunkManager.CHUNK_SIZE * this.scale,
      this.chunkManager.CHUNK_SIZE * this.scale
    );
  }

  private renderPlayer(): void {
    // 绘制玩家
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(
      this.canvas.width / 2,
      this.canvas.height / 2,
      1,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  private getVisibleChunks(): Chunk[] {
    const chunks: Chunk[] = [];
    const { x, y } = this.gameState.playerPosition;
    // console.log(x, y)
    // 增加视距以提前加载
    const viewDistance =
      Math.max(this.canvas.width, this.canvas.height) / 2 +
      this.chunkManager.CHUNK_SIZE;

    const startChunkX = Math.floor(
      (x - viewDistance) / this.chunkManager.CHUNK_SIZE
    );
    const endChunkX = Math.ceil(
      (x + viewDistance) / this.chunkManager.CHUNK_SIZE
    );
    const startChunkY = Math.floor(
      (y - viewDistance) / this.chunkManager.CHUNK_SIZE
    );
    const endChunkY = Math.ceil(
      (y + viewDistance) / this.chunkManager.CHUNK_SIZE
    );

    for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY++) {
      for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX++) {
        chunks.push(this.chunkManager.getChunkAt(chunkX, chunkY));
      }
    }

    return chunks;
  }

  private saveGameState(): void {
    localStorage.setItem("gameState", JSON.stringify(this.gameState));
  }

  private loadGameState(): void {
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
      this.gameState = JSON.parse(savedState);
    }
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();

    const zoomFactor = 0.1;
    const delta = event.deltaY > 0 ? -zoomFactor : zoomFactor;
    const newScale = Math.max(
      this.MIN_SCALE,
      Math.min(this.MAX_SCALE, this.scale + delta)
    );

    this.scale = newScale;
    this.scaleChanged = true;
  }

  public destroy() {
    this.canvas.removeEventListener("click", this.handleClick.bind(this));
    this.canvas.removeEventListener("wheel", this.handleWheel.bind(this));
  }
}
