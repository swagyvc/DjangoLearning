import { ObjectPool, randomRange } from "./utils.js";

const MAX_PARTICLES = 120;

export class ParticleSystem {
    constructor() {
        this.pool = new ObjectPool(() => ({
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            life: 0,
            maxLife: 1,
            size: 4,
            color: "#fff",
            gravity: 0,
            type: "dust",
        }), 64);
        this.leafTimer = 0;
    }

    reset() {
        this.pool.releaseAll();
        this.leafTimer = 0;
    }

    _emit(count, factory) {
        for (let i = 0; i < count; i++) {
            if (this.pool.active.length >= MAX_PARTICLES) break;
            const p = this.pool.acquire();
            factory(p, i);
        }
    }

    emitRunDust(x, y) {
        this._emit(1, (p) => {
            p.x = x + randomRange(-15, 15);
            p.y = y;
            p.vx = randomRange(-30, 30);
            p.vy = randomRange(-20, -5);
            p.life = randomRange(0.2, 0.45);
            p.maxLife = p.life;
            p.size = randomRange(3, 6);
            p.color = "rgba(180,140,80,0.7)";
            p.gravity = 120;
            p.type = "dust";
        });
    }

    emitJumpDust(x, y) {
        this._emit(8, (p) => {
            p.x = x + randomRange(-25, 25);
            p.y = y;
            p.vx = randomRange(-80, 80);
            p.vy = randomRange(-60, -20);
            p.life = randomRange(0.3, 0.6);
            p.maxLife = p.life;
            p.size = randomRange(4, 8);
            p.color = "rgba(200,160,90,0.8)";
            p.gravity = 200;
            p.type = "dust";
        });
    }

    emitCoinSparkle(x, y) {
        this._emit(10, (p) => {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(60, 180);
            p.x = x;
            p.y = y;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.life = randomRange(0.25, 0.5);
            p.maxLife = p.life;
            p.size = randomRange(3, 7);
            p.color = randomRange(0, 1) > 0.5 ? "#FFD700" : "#FFF8DC";
            p.gravity = 80;
            p.type = "sparkle";
        });
    }

    emitExplosion(x, y) {
        this._emit(24, (p) => {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(80, 280);
            p.x = x;
            p.y = y;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.life = randomRange(0.4, 0.9);
            p.maxLife = p.life;
            p.size = randomRange(4, 12);
            p.color = randomRange(0, 1) > 0.5 ? "#ff4500" : "#FFD700";
            p.gravity = 300;
            p.type = "explosion";
        });
    }

    emitLeaf(width, height) {
        this._emit(1, (p) => {
            p.x = randomRange(0, width);
            p.y = randomRange(-20, height * 0.4);
            p.vx = randomRange(20, 60);
            p.vy = randomRange(10, 40);
            p.life = randomRange(2, 4);
            p.maxLife = p.life;
            p.size = randomRange(5, 10);
            p.color = randomRange(0, 1) > 0.5 ? "#3d8b37" : "#5cb85c";
            p.gravity = 15;
            p.type = "leaf";
        });
    }

    update(dt, width, height, playerRunning, playerX, playerGroundY) {
        if (playerRunning) {
            if (Math.random() < dt * 8) {
                this.emitRunDust(playerX, playerGroundY);
            }
        }

        this.leafTimer -= dt;
        if (this.leafTimer <= 0) {
            this.emitLeaf(width, height);
            this.leafTimer = randomRange(0.8, 2.5);
        }

        const toRelease = [];
        this.pool.forEachActive((p) => {
            p.life -= dt;
            p.vy += p.gravity * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.life <= 0 || p.y > height + 50) {
                toRelease.push(p);
            }
        });
        for (const p of toRelease) {
            this.pool.release(p);
        }
    }

    draw(ctx) {
        this.pool.forEachActive((p) => {
            const alpha = Math.max(0, p.life / p.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;

            if (p.type === "leaf") {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, p.life, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }
}
