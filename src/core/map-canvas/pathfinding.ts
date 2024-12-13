import { TerrainType } from '../terrain-generator/terrain-generator';
import { Point } from '..';

interface Node {
    x: number;
    y: number;
    g: number;  // 从起点到当前点的成本
    h: number;  // 从当前点到终点的估计成本
    f: number;  // g + h
    parent: Node | null;
}

export class PathFinder {
    private readonly DIRECTIONS = [
        { x: 0, y: -1 },  // 上
        { x: 1, y: -1 },  // 右上
        { x: 1, y: 0 },   // 右
        { x: 1, y: 1 },   // 右下
        { x: 0, y: 1 },   // 下
        { x: -1, y: 1 },  // 左下
        { x: -1, y: 0 },  // 左
        { x: -1, y: -1 }, // 左上
    ];

    // 添加最大搜索次数常量
    private readonly MAX_ITERATIONS = 1000;

    constructor(private getTerrainAt: (x: number, y: number) => TerrainType) {}

    public findPath(start: Point, end: Point): Point[] {
        const openSet: Node[] = [];
        const closedSet: Set<string> = new Set();
        let iterations = 0;  // 添加迭代计数器
        
        const startNode: Node = {
            x: Math.round(start.x),
            y: Math.round(start.y),
            g: 0,
            h: this.heuristic(start, end),
            f: 0,
            parent: null
        };
        startNode.f = startNode.g + startNode.h;
        
        openSet.push(startNode);

        while (openSet.length > 0) {
            // 添加迭代次数检查
            if (iterations++ >= this.MAX_ITERATIONS) {
                console.warn('Path finding exceeded maximum iterations');
                return [];
            }

            // 获取f值最小的节点
            const currentNode = this.getLowestFNode(openSet);
            
            // 到达目标
            if (this.isAtDestination(currentNode, end)) {
                return this.reconstructPath(currentNode);
            }

            // 从开放列表中移除当前节点
            openSet.splice(openSet.indexOf(currentNode), 1);
            closedSet.add(`${currentNode.x},${currentNode.y}`);

            // 检查所有相邻节点
            for (const direction of this.DIRECTIONS) {
                const neighborX = currentNode.x + direction.x;
                const neighborY = currentNode.y + direction.y;
                const nodeKey = `${neighborX},${neighborY}`;

                // 跳过已经检查过的节点
                if (closedSet.has(nodeKey)) continue;

                // 检查地形是否可通行
                const terrain = this.getTerrainAt(neighborX, neighborY);
                if (!terrain.isWalkable) continue;

                const gScore = currentNode.g + this.getMovementCost(direction);
                const neighbor: Node = {
                    x: neighborX,
                    y: neighborY,
                    g: gScore,
                    h: this.heuristic({ x: neighborX, y: neighborY }, end),
                    f: 0,
                    parent: currentNode
                };
                neighbor.f = neighbor.g + neighbor.h;

                // 检查节点是否已在开放列表中
                const existingNode = openSet.find(n => n.x === neighborX && n.y === neighborY);
                if (existingNode) {
                    if (gScore < existingNode.g) {
                        // 更新现有节点的值
                        existingNode.g = gScore;
                        existingNode.f = gScore + existingNode.h;
                        existingNode.parent = currentNode;
                    }
                } else {
                    openSet.push(neighbor);
                }
            }
        }

        // 没有找到路径
        return [];
    }

    private heuristic(a: Point, b: Point): number {
        // 使用欧几里得距离作为启发式函数
        return Math.sqrt(
            Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)
        );
    }

    private getLowestFNode(nodes: Node[]): Node {
        return nodes.reduce((lowest, node) => 
            node.f < lowest.f ? node : lowest
        , nodes[0]);
    }

    private isAtDestination(node: Node, end: Point): boolean {
        const dx = Math.abs(node.x - end.x);
        const dy = Math.abs(node.y - end.y);
        return dx <= 1 && dy <= 1;
    }

    private getMovementCost(direction: Point): number {
        // 斜向移动成本更高
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
        // 路径平滑处理，移除不必要的中间点
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
        // 检查两点之间是否有障碍物
        const steps = Math.max(
            Math.abs(end.x - start.x),
            Math.abs(end.y - start.y)
        );

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = Math.round(start.x + (end.x - start.x) * t);
            const y = Math.round(start.y + (end.y - start.y) * t);
            
            if (!this.getTerrainAt(x, y).isWalkable) {
                return false;
            }
        }

        return true;
    }
} 