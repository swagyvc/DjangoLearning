import { ObjectPool, randomInt } from "./utils.js";

const TYPES = {
    shield: { color: "#4da6ff", label: "Shield", duration: 8, weight: 25 },
    magnet: { color: "#ff66cc", label: "Magnet", duration: 6, weight: 25 },
    doubleScore: { color: "#66ff66", label: "2x Score", duration: 10, weight: 25 },
    speedBoost: { color: "#ff9933", label: "Speed+", duration: 5, weight: 25 },
};

const TYPE_KEYS = Object.keys(TYPES);

const BASE_SPAWN_INTERVAL = 12;
const POWERUP_SIZE = 36;

export class PowerUpManager {
    constructor() {
        this.pool = new ObjectPool(() => ({
            lane: 0,
            y: 0,
            type: "shield",
            bobPhase: 0,
            active: true,
        }));
        this.spawnTimer = 8;
        this.activeEffects = {
            shield: 0,
            magnet: 0,
            doubleScore: 0,
            speedBoost: 0,
        };
    }

    reset() {
        this.pool.releaseAll();
        this.spawnTimer = 6;
        for (const key of TYPE_KEYS) {
            this.activeEffects[key] = 0;
        }
    }

    pickType() {
        return TYPE_KEYS[randomInt(0, TYPE_KEYS.length - 1)];
    }

    spawn(horizonY) {
        const type = this.pickType();
        const obj = this.pool.acquire();
        obj.lane = randomInt(0, 2);
        obj.y = horizonY - 40;
        obj.type = type;
        obj.bobPhase = Math.random() * Math.PI * 2;
        obj.active = true;
        return obj;
    }

    activate(type) {
        const duration = TYPES[type]?.duration ?? 5;
        this.activeEffects[type] = Math.max(this.activeEffects[type], duration);
    }

    update(dt, speed, canvasHeight, horizonY) {
        for (const key of TYPE_KEYS) {
            if (this.activeEffects[key] > 0) {
                this.activeEffects[key] -= dt;
                if (this.activeEffects[key] < 0) {
                    this.activeEffects[key] = 0;
                }
            }
        }

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawn(horizonY);
            this.spawnTimer = BASE_SPAWN_INTERVAL + Math.random() * 6;
        }

        const toRelease = [];
        this.pool.forEachActive((pu) => {
            pu.y += speed * dt;
            pu.bobPhase += dt * 4;
            if (pu.y > canvasHeight + 80) {
                toRelease.push(pu);
            }
        });
        for (const pu of toRelease) {
            this.pool.release(pu);
        }
    }

    getScaleAtY(y, height) {
        const horizonY = height * 0.22;
        const groundY = height - 180;
        const t = Math.max(0, Math.min(1, (y - horizonY) / (groundY - horizonY)));
        return 0.35 + t * 0.65;
    }

    getScreenBounds(pu, road, width, height) {
        const scale = this.getScaleAtY(pu.y, height);
        const size = POWERUP_SIZE * scale;
        const bob = Math.sin(pu.bobPhase) * 4 * scale;
        const cx = road.getLaneX(pu.lane, pu.y + size / 2, width, height);
        return {
            x: cx - size / 2,
            y: pu.y + bob,
            width: size,
            height: size,
            centerX: cx,
            centerY: pu.y + bob + size / 2,
        };
    }

    draw(ctx, road, width, height) {
        this.pool.forEachActive((pu) => {
            const bounds = this.getScreenBounds(pu, road, width, height);
            const def = TYPES[pu.type];
            const { x, y, width: w, height: h } = bounds;

            ctx.save();
            ctx.fillStyle = def.color;
            ctx.shadowColor = def.color;
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 6);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.fillStyle = "#fff";
            ctx.font = `bold ${Math.floor(w * 0.45)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const icon = {
                shield: "🛡",
                magnet: "M",
                doubleScore: "2x",
                speedBoost: "»",
            }[pu.type];
            ctx.fillText(icon, x + w / 2, y + h / 2);

            ctx.restore();
        });
    }

    isActive(type) {
        return this.activeEffects[type] > 0;
    }

    getRemaining(type) {
        return this.activeEffects[type];
    }

    get active() {
        return this.pool.active;
    }

    consumeShield() {
        this.activeEffects.shield = 0;
    }

    getActiveEffects() {
        const result = [];
        for (const key of TYPE_KEYS) {
            if (this.activeEffects[key] > 0) {
                result.push({ type: key, remaining: this.activeEffects[key], label: TYPES[key].label });
            }
        }
        return result;
    }
}
