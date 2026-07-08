import { ObjectPool, randomInt } from "./utils.js";

const BASE_SPAWN_INTERVAL = 0.9;
const COIN_RADIUS = 18;
const MAGNET_RANGE = 220;
const MAGNET_PULL = 900;

export class CoinManager {
    constructor() {
        this.pool = new ObjectPool(() => ({
            lane: 0,
            y: 0,
            rotation: 0,
            magnetOffsetX: 0,
            active: true,
        }));
        this.spawnTimer = 0.3;
        this.collectedThisFrame = 0;
    }

    reset() {
        this.pool.releaseAll();
        this.spawnTimer = 0.2;
        this.collectedThisFrame = 0;
    }

    spawn(horizonY) {
        const obj = this.pool.acquire();
        obj.lane = randomInt(0, 2);
        obj.y = horizonY - 30;
        obj.rotation = Math.random() * Math.PI * 2;
        obj.magnetOffsetX = 0;
        obj.active = true;
        return obj;
    }

    spawnRow(horizonY, count = 3) {
        const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, count);
        for (const lane of lanes) {
            const obj = this.pool.acquire();
            obj.lane = lane;
            obj.y = horizonY - 30 + Math.random() * 20;
            obj.rotation = Math.random() * Math.PI * 2;
            obj.magnetOffsetX = 0;
            obj.active = true;
        }
    }

    update(dt, speed, canvasHeight, horizonY, magnetActive, playerX, playerY, road, width) {
        this.collectedThisFrame = 0;

        const interval = Math.max(0.45, BASE_SPAWN_INTERVAL - speed / 3000);
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            if (Math.random() < 0.35) {
                this.spawnRow(horizonY, randomInt(1, 3));
            } else {
                this.spawn(horizonY);
            }
            this.spawnTimer = interval + Math.random() * 0.3;
        }

        const toRelease = [];
        this.pool.forEachActive((coin) => {
            coin.y += speed * dt;
            coin.rotation += dt * 5;

            if (magnetActive && road) {
                const bounds = this.getScreenBounds(coin, road, width, canvasHeight);
                const cx = bounds.centerX;
                const cy = bounds.centerY;
                const dx = playerX - cx;
                const dy = playerY - cy;
                const dist = Math.hypot(dx, dy);
                if (dist < MAGNET_RANGE && dist > 1) {
                    const pull = MAGNET_PULL * dt;
                    coin.y += (dy / dist) * pull;
                    coin.magnetOffsetX += (dx / dist) * pull;
                }
            }

            if (coin.y > canvasHeight + 80) {
                toRelease.push(coin);
            }
        });
        for (const coin of toRelease) {
            this.pool.release(coin);
        }
    }

    getScaleAtY(y, height) {
        const horizonY = height * 0.22;
        const groundY = height - 180;
        const t = Math.max(0, Math.min(1, (y - horizonY) / (groundY - horizonY)));
        return 0.35 + t * 0.65;
    }

    getScreenBounds(coin, road, width, height) {
        const scale = this.getScaleAtY(coin.y, height);
        const r = COIN_RADIUS * scale;
        const laneX = road
            ? road.getLaneX(coin.lane, coin.y + r, width, height)
            : width / 2;
        const cx = laneX + (coin.magnetOffsetX || 0);
        return {
            x: cx - r,
            y: coin.y,
            width: r * 2,
            height: r * 2,
            centerX: cx,
            centerY: coin.y + r,
            radius: r,
        };
    }

    draw(ctx, road, width, height) {
        this.pool.forEachActive((coin) => {
            const bounds = this.getScreenBounds(coin, road, width, height);
            const { centerX, centerY, radius: r } = bounds;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(coin.rotation);

            ctx.fillStyle = "#FFD700";
            ctx.beginPath();
            ctx.ellipse(0, 0, r, r * 0.85, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#E6A800";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 0.7, r * 0.6, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#FFF8DC";
            ctx.beginPath();
            ctx.arc(r * 0.25, -r * 0.15, r * 0.15, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    get active() {
        return this.pool.active;
    }
}
