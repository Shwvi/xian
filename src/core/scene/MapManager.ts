import Konva from "konva";
import { SceneManager } from "./SceneManager";
import { UserSystem } from "../user";

export class MapManager {
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private playerLayer: Konva.Layer;
  private playerGroup: Konva.Group;
  private player: Konva.RegularPolygon;
  private playerShadow: Konva.Ellipse;
  private landmarks: Konva.Group[] = [];
  private animation: Konva.Animation | null = null;
  private isDragging = false;
  private currentTween: Konva.Tween | null = null;
  private isAnimating = false;

  constructor(
    private container: HTMLDivElement,
    private sceneManager: SceneManager,
    private userSystem: UserSystem
  ) {
    // 初始化舞台
    this.stage = new Konva.Stage({
      container: container,
      width: container.clientWidth,
      height: container.clientHeight,
      draggable: false,
    });

    // 創建主圖層（用於地標等）
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // 創建玩家圖層
    this.playerLayer = new Konva.Layer();
    this.stage.add(this.playerLayer);

    const pos = this.getPlayerPosition();
    const validPos = pos.x !== 0 && pos.y !== 0;
    // 創建玩家組
    this.playerGroup = new Konva.Group({
      x: validPos ? pos.x : this.stage.width() / 2,
      y: validPos ? pos.y : this.stage.height() / 2,
    });

    // 初始化玩家
    this.player = new Konva.RegularPolygon({
      sides: 3,
      radius: 10,
      fill: "red",
      shadowBlur: 10,
      shadowColor: "yellow",
      rotation: 180,
    });

    // 添加玩家陰影
    this.playerShadow = new Konva.Ellipse({
      y: 15, // 相對於組的位置
      radiusX: 10,
      radiusY: 4,
      fill: "rgba(0,0,0,0.2)",
      listening: false,
    });

    // 將玩家和陰影添加到組中
    this.playerGroup.add(this.playerShadow);
    this.playerGroup.add(this.player);

    // 將組添加到圖層
    this.playerLayer.add(this.playerGroup);

    // 創建所有地標
    this.createLandmarks();

    // 設置邊界
    this.setBoundaries();

    // 初始化動畫
    this.initPlayerAnimation();

    // 綁定事件
    this.bindEvents();

    this.centerMap();
  }

  private getPlayerPosition() {
    return this.userSystem.user$.get()!.position;
  }

  private createLandmarks() {
    this.sceneManager.data.regions.forEach((region) => {
      region.landmarks.forEach((landmark) => {
        const group = new Konva.Group({
          x: landmark.position.x,
          y: landmark.position.y,
          id: landmark.id,
        });

        // 地標圖標
        const icon = new Konva.Circle({
          sides: 3,
          radius: 5,
          fill: "#4CAF50",
          strokeWidth: 2,
        });

        // 地標名稱
        const text = new Konva.Text({
          text: landmark.name,
          fontSize: 14,
          fill: "white",
          y: -25,
          align: "center",
        });
        text.offsetX(text.width() / 2);

        group.add(icon);
        group.add(text);

        group.on("click touchstart", () => {
          this.movePlayerTo(landmark.position.x, landmark.position.y);
        });

        this.landmarks.push(group);
        this.layer.add(group);
      });
    });
  }

  private async movePlayerTo(x: number, y: number) {
    // 取消当前正在进行的动画
    if (this.currentTween) {
      this.currentTween.destroy();
    }

    // 定义玩家移动速度 (像素/秒)
    const PLAYER_SPEED = 50; // 可以根据需要调整这个值

    // 计算距离
    const dx = x - this.playerGroup.x();
    const dy = y - this.playerGroup.y();
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 计算所需时间 (秒)
    const duration = distance / PLAYER_SPEED;

    try {
      if (!this.isAnimating) await this.smoothCenterMap(0.2);
      this.isAnimating = true;

      await new Promise<void>((resolve) => {
        this.currentTween = new Konva.Tween({
          node: this.playerGroup,
          x: x,
          y: y,
          duration: duration, // 使用计算出的时间
          easing: Konva.Easings.EaseInOut,
          onUpdate: () => {
            this.centerMap();
          },
          onFinish: () => {
            this.currentTween = null;
            this.sceneManager.isMoving.set(false);
            resolve();
          },
        }).play();
        this.sceneManager.isMoving.set(true);
      });

      this.sceneManager.updateNearLandmarks(this.getNearbyLandmarks());
      this.userSystem.updateUserPosition({
        x: this.playerGroup.x(),
        y: this.playerGroup.y(),
      });
    } finally {
      this.isAnimating = false;
    }
  }

  private centerMap() {
    const scale = this.stage.scaleX();
    const targetX = this.stage.width() / 2 - this.playerGroup.x() * scale;
    const targetY = this.stage.height() / 2 - this.playerGroup.y() * scale;

    // 直接设置位置,不使用动画以避免延迟
    this.stage.position({
      x: targetX,
      y: targetY,
    });

    this.stage.batchDraw();
  }

  private async smoothCenterMap(duration = 0.5) {
    const scale = this.stage.scaleX();
    const targetX = this.stage.width() / 2 - this.playerGroup.x() * scale;
    const targetY = this.stage.height() / 2 - this.playerGroup.y() * scale;

    // 如果目标位置非常接近当前位置，直接设置位置
    const currentPos = this.stage.position();
    if (
      Math.abs(currentPos.x - targetX) < 1 &&
      Math.abs(currentPos.y - targetY) < 1
    ) {
      this.stage.position({ x: targetX, y: targetY });
      this.stage.batchDraw();
      return;
    }

    return new Promise<void>((resolve) => {
      if (this.currentTween) {
        this.currentTween.destroy();
      }

      this.currentTween = new Konva.Tween({
        node: this.stage,
        duration: duration,
        easing: Konva.Easings.EaseOut,
        x: targetX,
        y: targetY,
        onFinish: () => {
          this.currentTween = null;
          this.stage.batchDraw();
          resolve();
        },
      }).play();
    });
  }

  private setBoundaries() {
    const maxX = 1000; // 設置地圖邊界
    const maxY = 1000;

    this.stage.on("dragmove", () => {
      const pos = this.stage.position();
      const scale = this.stage.scaleX();

      // 限制拖動範圍
      if (pos.x > maxX) this.stage.x(maxX);
      if (pos.x < -maxX) this.stage.x(-maxX);
      if (pos.y > maxY) this.stage.y(maxY);
      if (pos.y < -maxY) this.stage.y(-maxY);
    });
  }

  private initPlayerAnimation() {
    const amplitude = 2;
    const period = 1200;

    this.animation = new Konva.Animation((frame) => {
      if (!frame) return;

      const sinValue = Math.sin((frame.time * 2 * Math.PI) / period);

      // 只改变 player 的相对位置
      this.player.y(-amplitude * sinValue);

      // 更新陰影的縮放和透明度
      const shadowScale = 1 - Math.abs(sinValue) * 0.3;
      this.playerShadow.scaleX(shadowScale);
      this.playerShadow.scaleY(shadowScale);
      this.playerShadow.opacity(0.2 + Math.abs(sinValue) * 0.1);
    }, this.playerLayer);

    this.animation.start();
  }

  private bindEvents() {
    // 支持移動端縮放
    // let lastCenter: any = null;
    // let lastDist = 0;

    // this.stage.on("touchmove", (e) => {
    //   e.evt.preventDefault();
    //   const touch1 = e.evt.touches[0];
    //   const touch2 = e.evt.touches[1];

    //   if (touch1 && touch2) {
    //     if (this.isDragging) {
    //       this.stage.draggable(false);
    //       this.isDragging = false;
    //     }

    //     const center = {
    //       x: (touch1.clientX + touch2.clientX) / 2,
    //       y: (touch1.clientY + touch2.clientY) / 2,
    //     };

    //     const dist = Math.sqrt(
    //       Math.pow(touch2.clientX - touch1.clientX, 2) +
    //         Math.pow(touch2.clientY - touch1.clientY, 2)
    //     );

    //     if (!lastCenter) {
    //       lastCenter = center;
    //       lastDist = dist;
    //       return;
    //     }

    //     const scale = this.stage.scaleX() * (dist / lastDist);

    //     // 限制縮放範圍
    //     const newScale = Math.max(0.5, Math.min(scale, 3));

    //     this.stage.scale({ x: newScale, y: newScale });
    //     this.centerMap();

    //     lastDist = dist;
    //     lastCenter = center;
    //   }
    // });

    // this.stage.on("touchend", () => {
    //   lastCenter = null;
    //   lastDist = 0;
    //   this.stage.draggable(true);
    //   this.isDragging = true;
    // });

    this.stage.on("click", (e) => {
      const pos = this.stage.getRelativePointerPosition();
      if (!pos) return;
      this.movePlayerTo(pos.x, pos.y);
    });
  }

  // 公共方法：更新舞台大小
  public resize() {
    this.stage.width(this.container.clientWidth);
    this.stage.height(this.container.clientHeight);
    this.centerMap();
  }

  // 清理資源
  public destroy() {
    this.animation?.stop();
    this.stage.destroy();
  }

  /**
   * 获取玩家附近的地标
   * @param radius 搜索半径（像素单位）
   * @returns 返回在指定半径内的地标数组
   */
  public getNearbyLandmarks(radius: number = 10) {
    const playerPos = {
      x: this.playerGroup.x(),
      y: this.playerGroup.y(),
    };

    return this.landmarks
      .filter((landmark) => {
        const landmarkPos = {
          x: landmark.x(),
          y: landmark.y(),
        };

        // 计算地标与玩家之间的距离
        const distance = Math.sqrt(
          Math.pow(landmarkPos.x - playerPos.x, 2) +
            Math.pow(landmarkPos.y - playerPos.y, 2)
        );

        return distance <= radius;
      })
      .map((landmark) => ({
        id: landmark.id(),
        position: {
          x: landmark.x(),
          y: landmark.y(),
        },
        distance: Math.sqrt(
          Math.pow(landmark.x() - playerPos.x, 2) +
            Math.pow(landmark.y() - playerPos.y, 2)
        ),
      }));
  }
}
