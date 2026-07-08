import { clamp, dtScale } from "./utils.js";

const STAND_HEIGHT = 90;
const SLIDE_HEIGHT = 45;
const SLIDE_DURATION = 0.5;
const JUMP_VELOCITY = -1080;
const GRAVITY = 54;
const LANE_LERP = 0.18;
const INVULN_DURATION = 1.5;

export class Player {
    constructor() {
        this.lane = 1;
        this.targetLane = 1;
        this.width = 60;
        this.height = STAND_HEIGHT;
        this.standHeight = STAND_HEIGHT;

        this.x = 0;
        this.y = 0;
        this.groundY = 0;

        this.jumping = false;
        this.velocityY = 0;
        this.sliding = false;
        this.slideTimer = 0;

        this.state = "idle";
        this.runFrame = 0;
        this.runTimer = 0;

        this.invulnerable = false;
        this.invulnTimer = 0;
        this.dead = false;
    }

    reset(laneX, groundY) {
        this.lane = 1;
        this.targetLane = 1;
        this.x = laneX;
        this.y = groundY;
        this.groundY = groundY;
        this.height = STAND_HEIGHT;
        this.jumping = false;
        this.velocityY = 0;
        this.sliding = false;
        this.slideTimer = 0;
        this.state = "run";
        this.runFrame = 0;
        this.runTimer = 0;
        this.invulnerable = false;
        this.invulnTimer = 0;
        this.dead = false;
    }

    onResize(groundY) {
        const wasGrounded = !this.jumping && !this.sliding;
        this.groundY = groundY;
        if (wasGrounded) {
            this.y = groundY;
        }
    }

    moveLeft() {
        if (this.dead) return;
        this.targetLane = clamp(this.targetLane - 1, 0, 2);
    }

    moveRight() {
        if (this.dead) return;
        this.targetLane = clamp(this.targetLane + 1, 0, 2);
    }

    jump() {
        if (this.dead || this.jumping || this.sliding) return false;
        this.jumping = true;
        this.velocityY = JUMP_VELOCITY;
        this.state = "jump";
        return true;
    }

    slide() {
        if (this.dead || this.sliding || this.jumping) return;
        this.sliding = true;
        this.slideTimer = SLIDE_DURATION;
        this.height = SLIDE_HEIGHT;
        this.y += STAND_HEIGHT - SLIDE_HEIGHT;
        this.state = "slide";
    }

    endSlide() {
        if (!this.sliding) return;
        this.y -= STAND_HEIGHT - SLIDE_HEIGHT;
        this.height = STAND_HEIGHT;
        this.sliding = false;
        this.slideTimer = 0;
        if (!this.jumping && !this.dead) {
            this.state = "run";
        }
    }

    hit() {
        if (this.invulnerable || this.dead) return false;
        this.die();
        return true;
    }

    die() {
        this.dead = true;
        this.state = "death";
        this.sliding = false;
        this.height = STAND_HEIGHT;
    }

    activateInvulnerability() {
        this.invulnerable = true;
        this.invulnTimer = INVULN_DURATION;
    }

    update(dt, laneX) {
        if (this.dead) return;

        const t = dtScale(dt, LANE_LERP);
        this.x = this.x + (laneX - this.x) * t;
        this.lane = this.targetLane;

        if (this.invulnerable) {
            this.invulnTimer -= dt;
            if (this.invulnTimer <= 0) {
                this.invulnerable = false;
                this.invulnTimer = 0;
            }
        }

        if (this.sliding) {
            this.slideTimer -= dt;
            if (this.slideTimer <= 0) {
                this.endSlide();
            }
        }

        if (this.jumping) {
            this.velocityY += GRAVITY * dt * 60;
            this.y += this.velocityY * dt;

            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.velocityY = 0;
                this.jumping = false;
                if (!this.sliding) {
                    this.state = "run";
                }
            }
        } else if (!this.sliding) {
            this.runTimer += dt;
            if (this.runTimer >= 0.1) {
                this.runTimer = 0;
                this.runFrame = (this.runFrame + 1) % 4;
            }
            if (this.state === "idle") {
                this.state = "run";
            }
        }
    }

    draw(ctx) {
        if (this.invulnerable && Math.floor(this.invulnTimer * 10) % 2 === 0) {
            return;
        }

        const px = this.x - this.width / 2;
        const py = this.y;

        ctx.save();

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(this.x, this.groundY + this.height - 4, this.width * 0.4, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(px, py, this.width, this.height);

        // Run animation — leg offset
        if (this.state === "run" && !this.jumping) {
            const legOffset = (this.runFrame % 2 === 0 ? 4 : -4);
            ctx.fillStyle = "#E6C200";
            ctx.fillRect(px + 8, py + this.height - 12, 14, 12);
            ctx.fillRect(px + this.width - 22 + legOffset, py + this.height - 12, 14, 12);
        }

        // Face
        ctx.fillStyle = "#333";
        const faceY = this.sliding ? py + 8 : py + 14;
        ctx.fillRect(px + this.width - 18, faceY, 8, 8);

        ctx.restore();
    }
}
