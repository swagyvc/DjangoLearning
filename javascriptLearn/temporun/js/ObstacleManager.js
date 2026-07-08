import { ObjectPool, randomInt } from "./utils.js";

const TYPES = {
    rock: { width: 55, height: 50, weight: 25, jumpOver: true, slideUnder: false, wide: false },
    tree: { width: 50, height: 100, weight: 20, jumpOver: false, slideUnder: false, wide: false },
    log: { width: 70, height: 35, weight: 20, jumpOver: false, slideUnder: true, wide: false },
    fire: { width: 50, height: 45, weight: 20, jumpOver: true, slideUnder: false, wide: false },
    bridge: { width: 100, height: 40, weight: 15, jumpOver: false, slideUnder: false, wide: true },
};

const TYPE_KEYS = Object.keys(TYPES);
const TOTAL_WEIGHT = TYPE_KEYS.reduce((sum, k) => sum + TYPES[k].weight, 0);

const BASE_SPAWN_INTERVAL = 1.4;
const MIN_SPAWN_INTERVAL = 0.55;

function pickType() {
    let roll = Math.random() * TOTAL_WEIGHT;
    for (const key of TYPE_KEYS) {
        roll -= TYPES[key].weight;
        if (roll <= 0) return key;
    }
    return TYPE_KEYS[0];
}

export class ObstacleManager {
    constructor() {
        this.pool = new ObjectPool(() => ({
            lane: 0,
            y: 0,
            type: "rock",
            width: 55,
            height: 50,
            jumpOver: false,
            slideUnder: false,
            wide: false,
            active: true,
        }));
        this.spawnTimer = 0;
    }

    reset() {
        this.pool.releaseAll();
        this.spawnTimer = 0.5;
    }

    spawn(horizonY) {
        const typeKey = pickType();
        const def = TYPES[typeKey];
        const lane = def.wide ? 1 : randomInt(0, 2);
        const obj = this.pool.acquire();
        obj.lane = lane;
        obj.y = horizonY - def.height;
        obj.type = typeKey;
        obj.width = def.width;
        obj.height = def.height;
        obj.jumpOver = def.jumpOver;
        obj.slideUnder = def.slideUnder;
        obj.wide = def.wide;
        obj.active = true;
        return obj;
    }

    update(dt, speed, canvasHeight, horizonY) {
        const interval = Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - speed / 2000);
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawn(horizonY);
            this.spawnTimer = interval + Math.random() * 0.4;
        }

        const toRelease = [];
        this.pool.forEachActive((obs) => {
            obs.y += speed * dt;
            if (obs.y > canvasHeight + 120) {
                toRelease.push(obs);
            }
        });
        for (const obs of toRelease) {
            this.pool.release(obs);
        }
    }

    getScaleAtY(y, height, road) {
        const horizonY = height * 0.22;
        const groundY = height - 180;
        const t = Math.max(0, Math.min(1, (y - horizonY) / (groundY - horizonY)));
        return 0.3 + t * 0.7;
    }

    getScreenBounds(obs, road, width, height) {
        const scale = this.getScaleAtY(obs.y, height, road);
        const w = obs.width * scale;
        const h = obs.height * scale;
        const cx = road.getLaneX(obs.lane, obs.y + h * 0.5, width, height);
        return {
            x: cx - w / 2,
            y: obs.y,
            width: w,
            height: h,
            centerX: cx,
        };
    }

    draw(ctx, road, width, height) {
        this.pool.forEachActive((obs) => {
            const bounds = this.getScreenBounds(obs, road, width, height);
            const { x, y, width: w, height: h } = bounds;

            ctx.save();

            switch (obs.type) {
                case "rock":
                    ctx.fillStyle = "#6b6b6b";
                    ctx.beginPath();
                    ctx.ellipse(x + w / 2, y + h * 0.6, w / 2, h * 0.45, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#888";
                    ctx.beginPath();
                    ctx.ellipse(x + w * 0.35, y + h * 0.4, w * 0.2, h * 0.15, -0.3, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case "tree":
                    ctx.fillStyle = "#5c3d1e";
                    ctx.fillRect(x + w * 0.4, y + h * 0.45, w * 0.2, h * 0.55);
                    ctx.fillStyle = "#2d6b2d";
                    ctx.beginPath();
                    ctx.moveTo(x + w / 2, y);
                    ctx.lineTo(x + w, y + h * 0.55);
                    ctx.lineTo(x, y + h * 0.55);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case "log":
                    ctx.fillStyle = "#8B4513";
                    ctx.beginPath();
                    ctx.roundRect(x, y + h * 0.35, w, h * 0.4, 6);
                    ctx.fill();
                    ctx.strokeStyle = "#654321";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    break;

                case "fire":
                    ctx.fillStyle = "#ff4500";
                    ctx.beginPath();
                    ctx.moveTo(x + w / 2, y);
                    ctx.lineTo(x + w, y + h);
                    ctx.lineTo(x, y + h);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#ffcc00";
                    ctx.beginPath();
                    ctx.moveTo(x + w / 2, y + h * 0.2);
                    ctx.lineTo(x + w * 0.7, y + h * 0.75);
                    ctx.lineTo(x + w * 0.3, y + h * 0.75);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case "bridge":
                    ctx.fillStyle = "#5c4033";
                    ctx.fillRect(x, y + h * 0.5, w, h * 0.35);
                    ctx.strokeStyle = "#3e2a1f";
                    ctx.lineWidth = 3;
                    for (let i = 0; i < 4; i++) {
                        const px = x + (w / 4) * i;
                        ctx.beginPath();
                        ctx.moveTo(px, y + h * 0.5);
                        ctx.lineTo(px, y + h);
                        ctx.stroke();
                    }
                    ctx.fillStyle = "#222";
                    ctx.fillRect(x + w * 0.1, y + h * 0.7, w * 0.25, h * 0.2);
                    ctx.fillRect(x + w * 0.65, y + h * 0.7, w * 0.25, h * 0.2);
                    break;
            }

            ctx.restore();
        });
    }

    get active() {
        return this.pool.active;
    }
}
