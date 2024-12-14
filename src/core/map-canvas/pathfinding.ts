import { Point } from ".";

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

class PriorityQueue<T> {
  private heap: T[] = [];

  constructor(private compare: (a: T, b: T) => number) {}

  get length(): number {
    return this.heap.length;
  }

  push(item: T) {
    this.heap.push(item);
    this.siftUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const result = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return result;
  }

  private siftUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
        [this.heap[index], this.heap[parentIndex]] = [
          this.heap[parentIndex],
          this.heap[index],
        ];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number) {
    while (true) {
      let minIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.heap.length &&
        this.compare(this.heap[leftChild], this.heap[minIndex]) < 0
      ) {
        minIndex = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.compare(this.heap[rightChild], this.heap[minIndex]) < 0
      ) {
        minIndex = rightChild;
      }

      if (minIndex === index) break;

      [this.heap[index], this.heap[minIndex]] = [
        this.heap[minIndex],
        this.heap[index],
      ];
      index = minIndex;
    }
  }
}

class NodePool {
  private pool: Node[] = [];
  private readonly MAX_POOL_SIZE = 1000;

  acquire(x: number, y: number, g: number = 0, h: number = 0): Node {
    if (this.pool.length > 0) {
      const node = this.pool.pop()!;
      node.x = x;
      node.y = y;
      node.g = g;
      node.h = h;
      node.f = g + h;
      node.parent = null;
      return node;
    }
    return { x, y, g, h, f: g + h, parent: null };
  }

  release(node: Node) {
    if (this.pool.length < this.MAX_POOL_SIZE) {
      this.pool.push(node);
    }
  }

  clear() {
    this.pool = [];
  }
}

export class PathFinder {
  private readonly DIRECTIONS = [
    { x: 0, y: -1, priority: 0 },
    { x: 1, y: -1, priority: 0 },
    { x: 1, y: 0, priority: 0 },
    { x: 1, y: 1, priority: 0 },
    { x: 0, y: 1, priority: 0 },
    { x: -1, y: 1, priority: 0 },
    { x: -1, y: 0, priority: 0 },
    { x: -1, y: -1, priority: 0 },
  ];

  private readonly BASE_ITERATIONS = 10000;
  private readonly ITERATIONS_PER_DISTANCE = 100;
  private readonly MAX_ITERATIONS = 100000;
  private readonly MAX_PATH_LENGTH = 100;
  private readonly nodePool = new NodePool();
  private readonly pathCache = new Map<string, Point[]>();
  private readonly cacheMaxSize = 100;

  constructor(private isWalkableAt: (x: number, y: number) => boolean) {}

  public findPath(start: Point, end: Point): Point[] {
    // 检查起点和终点是否可行走
    if (
      !this.isWalkableAt(Math.round(start.x), Math.round(start.y)) ||
      !this.isWalkableAt(Math.round(end.x), Math.round(end.y))
    ) {
      return [];
    }

    // 检查距离是否过远
    if (this.heuristic(start, end) > this.MAX_PATH_LENGTH) {
      return [];
    }

    // 检查缓存
    const cacheKey = `${start.x},${start.y}-${end.x},${end.y}`;
    if (this.pathCache.has(cacheKey)) {
      return [...this.pathCache.get(cacheKey)!];
    }

    const openSet = new PriorityQueue<Node>((a, b) => a.f - b.f);
    const closedSet = new Set<string>();
    let iterations = 0;

    const startNode = this.nodePool.acquire(
      Math.round(start.x),
      Math.round(start.y),
      0,
      this.heuristic(start, end)
    );

    openSet.push(startNode);

    // Calculate dynamic max iterations based on distance
    const distance = this.heuristic(start, end);
    const maxIterations =
      this.BASE_ITERATIONS + distance * this.ITERATIONS_PER_DISTANCE;

    while (openSet.length > 0) {
      if (iterations++ >= maxIterations) {
        console.warn("Path finding exceeded maximum iterations");
        this.nodePool.clear();
        return [];
      }

      const currentNode = openSet.pop()!;

      if (this.isAtDestination(currentNode, end)) {
        const path = this.reconstructPath(currentNode);
        this.cacheResult(cacheKey, path);
        return path;
      }

      closedSet.add(`${currentNode.x},${currentNode.y}`);

      // Sort directions based on target position
      const sortedDirections = this.getSortedDirections(currentNode, end);

      for (const direction of sortedDirections) {
        const neighborX = currentNode.x + direction.x;
        const neighborY = currentNode.y + direction.y;
        const nodeKey = `${neighborX},${neighborY}`;

        if (closedSet.has(nodeKey)) continue;

        if (!this.isWalkableAt(neighborX, neighborY)) continue;

        const gScore = currentNode.g + this.getMovementCost(direction);
        const hScore = this.heuristic({ x: neighborX, y: neighborY }, end);

        const neighbor = this.nodePool.acquire(
          neighborX,
          neighborY,
          gScore,
          hScore
        );
        neighbor.parent = currentNode;

        openSet.push(neighbor);
      }
    }

    this.nodePool.clear();
    return [];
  }

  private heuristic(a: Point, b: Point): number {
    // 使用切比雪夫距离作为启发式函数
    return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  }

  private isAtDestination(node: Node, end: Point): boolean {
    const dx = Math.abs(node.x - end.x);
    const dy = Math.abs(node.y - end.y);
    return dx <= 1 && dy <= 1;
  }

  private getMovementCost(direction: Point): number {
    return direction.x !== 0 && direction.y !== 0 ? 1.4 : 1;
  }

  private reconstructPath(endNode: Node): Point[] {
    const path: Point[] = [];
    let current: Node | null = endNode;

    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }

    return this.smoothPath(path);
  }

  private smoothPath(path: Point[]): Point[] {
    if (path.length <= 2) return path;

    const smoothed: Point[] = [path[0]];
    let current = 0;

    while (current < path.length - 1) {
      let furthest = current + 1;

      for (let i = current + 2; i < path.length; i++) {
        if (this.canMoveDirect(path[current], path[i])) {
          furthest = i;
        }
      }

      smoothed.push(path[furthest]);
      current = furthest;
    }

    return smoothed;
  }

  private canMoveDirect(start: Point, end: Point): boolean {
    const steps = Math.max(
      Math.abs(end.x - start.x),
      Math.abs(end.y - start.y)
    );

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(start.x + (end.x - start.x) * t);
      const y = Math.round(start.y + (end.y - start.y) * t);

      if (!this.isWalkableAt(x, y)) {
        return false;
      }
    }

    return true;
  }

  private cacheResult(key: string, path: Point[]) {
    if (this.pathCache.size >= this.cacheMaxSize) {
      const firstKey = this.pathCache.keys().next().value;
      this.pathCache.delete(firstKey);
    }
    this.pathCache.set(key, [...path]);
  }

  public clearCache() {
    this.pathCache.clear();
    this.nodePool.clear();
  }

  private getSortedDirections(
    current: Node,
    end: Point
  ): typeof this.DIRECTIONS {
    const dx = Math.sign(end.x - current.x);
    const dy = Math.sign(end.y - current.y);

    return [...this.DIRECTIONS]
      .map((dir) => ({
        ...dir,
        priority: (dir.x === dx ? 2 : 0) + (dir.y === dy ? 2 : 0),
      }))
      .sort((a, b) => b.priority - a.priority);
  }
}
