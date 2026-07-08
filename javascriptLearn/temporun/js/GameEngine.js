import { Player } from "./Player.js";
import { InputManager } from "./InputManager.js";
import { RoadRenderer } from "./RoadRenderer.js";
import { ParallaxBackground } from "./ParallaxBackground.js";
import { UIManager } from "./UIManager.js";
import { ObstacleManager } from "./ObstacleManager.js";
import { CoinManager } from "./CoinManager.js";
import { PowerUpManager } from "./PowerUpManager.js";
import { CollisionSystem } from "./CollisionSystem.js";
import { ParticleSystem } from "./ParticleSystem.js";
import { SoundManager } from "./SoundManager.js";
import { SaveManager } from "./SaveManager.js";

const BASE_SPEED = 540;
const MAX_SPEED = 1200;
const SPEED_RAMP = 12;
const PLAYER_GROUND_OFFSET = 180;
const SPEED_BOOST_MULT = 1.35;
const COIN_SCORE = 50;

export class GameEngine {
    constructor(canvas, ui, save, sound) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ui = ui;
        this.save = save;
        this.sound = sound;

        this.state = "menu";
        this.score = 0;
        this.sessionCoins = 0;
        this.highScore = save.getHighScore();
        this.speed = BASE_SPEED;
        this.playTime = 0;

        this.lastTime = 0;
        this.fps = 60;
        this._fpsAccum = 0;
        this._fpsFrames = 0;
        this._wasJumping = false;

        this.player = new Player();
        this.input = new InputManager(canvas);
        this.road = new RoadRenderer();
        this.background = new ParallaxBackground();
        this.obstacles = new ObstacleManager();
        this.coins = new CoinManager();
        this.powerUps = new PowerUpManager();
        this.particles = new ParticleSystem();

        this._bindUI();
        this.resize();
    }

    _bindUI() {
        this.ui.onPlay(() => {
            this.sound.playMenuClick();
            this.sound.resume();
            this.startGame();
        });
        this.ui.onResume(() => {
            this.sound.playMenuClick();
            this.resume();
        });
        this.ui.onRestart(() => {
            this.sound.playMenuClick();
            this.restart();
        });
        this.ui.onPause(() => {
            if (this.state === "playing") this.pause();
        });
        this.ui.onMuteToggle(() => {
            const muted = !this.save.isMuted();
            this.save.setMuted(muted);
            this.sound.setMuted(muted);
            this.ui.setMuted(muted);
            this.sound.playMenuClick();
        });

        this.ui.setMuted(this.save.isMuted());
        this.sound.setMuted(this.save.isMuted());
    }

    getHorizonY() {
        return this.canvas.height * 0.22;
    }

    getGroundY() {
        return this.canvas.height - PLAYER_GROUND_OFFSET;
    }

    getEffectiveSpeed() {
        let speed = this.speed;
        if (this.powerUps.isActive("speedBoost")) {
            speed *= SPEED_BOOST_MULT;
        }
        return speed;
    }

    getScoreMultiplier() {
        return this.powerUps.isActive("doubleScore") ? 2 : 1;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        const groundY = this.getGroundY();
        const laneX = this.road.getLaneX(1, groundY, this.canvas.width, this.canvas.height);
        this.player.onResize(groundY);
        if (this.state === "menu") {
            this.player.x = laneX;
            this.player.y = groundY;
            this.player.groundY = groundY;
        }
    }

    startGame() {
        this.state = "playing";
        this.score = 0;
        this.sessionCoins = 0;
        this.speed = BASE_SPEED;
        this.playTime = 0;
        this._wasJumping = false;

        this.obstacles.reset();
        this.coins.reset();
        this.powerUps.reset();
        this.particles.reset();
        this.background.scroll = 0;
        this.road.scrollOffset = 0;

        const groundY = this.getGroundY();
        const laneX = this.road.getLaneX(1, groundY, this.canvas.width, this.canvas.height);
        this.player.reset(laneX, groundY);

        this.input.setGameplayEnabled(true);
        this.ui.setState("playing");

        if (!this.save.isMuted()) {
            this.sound.startBackground();
        }
    }

    pause() {
        if (this.state !== "playing") return;
        this.state = "paused";
        this.input.setGameplayEnabled(false);
        this.ui.setState("paused");
        this.sound.playPause();
        this.sound.stopBackground();
    }

    resume() {
        if (this.state !== "paused") return;
        this.state = "playing";
        this.input.setGameplayEnabled(true);
        this.ui.setState("playing");
        this.lastTime = performance.now();
        this.sound.playPause();
        if (!this.save.isMuted()) {
            this.sound.startBackground();
        }
    }

    restart() {
        this.sound.stopBackground();
        this.startGame();
    }

    gameOver() {
        this.state = "gameover";
        this.highScore = this.save.saveHighScore(this.score);
        if (this.sessionCoins > 0) {
            this.save.addCoins(this.sessionCoins);
        }
        this.ui.showGameOver(this.score, this.sessionCoins, this.highScore);
        this.ui.setState("gameover");
        this.input.setGameplayEnabled(false);
        this.sound.playCollision();
        this.sound.stopBackground();
        this.particles.emitExplosion(this.player.x, this.player.y + this.player.height / 2);
    }

    _handleInput() {
        const actions = this.input.consumeActions();

        for (const action of actions) {
            switch (action) {
                case "pause":
                    if (this.state === "playing") this.pause();
                    else if (this.state === "paused") this.resume();
                    break;
                case "restart":
                    if (this.state === "gameover" || this.state === "menu") {
                        this.restart();
                    }
                    break;
                case "left":
                    if (this.state === "playing") this.player.moveLeft();
                    break;
                case "right":
                    if (this.state === "playing") this.player.moveRight();
                    break;
                case "jump":
                    if (this.state === "playing" && this.player.jump()) {
                        this.sound.playJump();
                    }
                    break;
                case "slide":
                    if (this.state === "playing") this.player.slide();
                    break;
            }
        }
    }

    _resolveCollisions(effectiveSpeed) {
        const { width, height } = this.canvas;
        const hasShield = this.powerUps.isActive("shield");

        const hitResult = CollisionSystem.checkObstacles(
            this.player,
            this.obstacles.pool.active,
            this.obstacles,
            this.road,
            width,
            height,
            hasShield
        );

        if (hitResult.shieldUsed) {
            this.powerUps.consumeShield();
            this.sound.playShieldHit();
            this.particles.emitExplosion(
                this.player.x,
                this.player.y + this.player.height / 2
            );
        }

        const collectedCoins = CollisionSystem.checkCoins(
            this.player,
            this.coins.pool.active,
            this.coins,
            this.road,
            width,
            height
        );

        const mult = this.getScoreMultiplier();
        for (const coin of collectedCoins) {
            this.coins.pool.release(coin);
            this.sessionCoins += 1;
            this.score += COIN_SCORE * mult;
            this.sound.playCoin();
            const bounds = { centerX: this.player.x, centerY: this.player.y };
            this.particles.emitCoinSparkle(bounds.centerX, bounds.centerY);
        }

        const collectedPU = CollisionSystem.checkPowerUps(
            this.player,
            this.powerUps.pool.active,
            this.powerUps,
            this.road,
            width,
            height
        );

        if (collectedPU) {
            this.powerUps.pool.release(collectedPU);
            this.powerUps.activate(collectedPU.type);
            this.sound.playPowerUp();
            this.particles.emitCoinSparkle(this.player.x, this.player.y);
        }
    }

    update(dt) {
        this._handleInput();

        const { width, height } = this.canvas;
        const horizonY = this.getHorizonY();
        const groundY = this.getGroundY();

        if (this.state === "menu") {
            const laneX = this.road.getLaneX(1, groundY, width, height);
            this.player.update(dt, laneX);
            this.road.update(dt, this.speed * 0.3);
            this.background.update(dt, this.speed * 0.3);
            return;
        }

        if (this.state !== "playing") {
            if (this.state === "gameover") {
                this.particles.update(dt, width, height, false, 0, groundY);
            }
            return;
        }

        const effectiveSpeed = this.getEffectiveSpeed();
        const scoreMult = this.getScoreMultiplier();

        this.playTime += dt;
        this.speed = Math.min(BASE_SPEED + this.playTime * SPEED_RAMP, MAX_SPEED);
        this.score += effectiveSpeed * dt * 0.1 * scoreMult;

        const laneX = this.road.getLaneX(
            this.player.targetLane,
            groundY,
            width,
            height
        );

        const wasJumping = this.player.jumping;
        this.player.update(dt, laneX);

        if (wasJumping && !this.player.jumping) {
            this.particles.emitJumpDust(this.player.x, groundY);
        }
        this._wasJumping = this.player.jumping;

        this.road.update(dt, effectiveSpeed);
        this.background.update(dt, effectiveSpeed);

        const magnetActive = this.powerUps.isActive("magnet");
        this.obstacles.update(dt, effectiveSpeed, height, horizonY);
        this.coins.update(
            dt,
            effectiveSpeed,
            height,
            horizonY,
            magnetActive,
            this.player.x,
            this.player.y + this.player.height / 2,
            this.road,
            width
        );
        this.powerUps.update(dt, effectiveSpeed, height, horizonY);

        this._resolveCollisions(effectiveSpeed);

        const playerRunning =
            !this.player.jumping && !this.player.sliding && !this.player.dead;
        this.particles.update(
            dt,
            width,
            height,
            playerRunning,
            this.player.x,
            groundY
        );

        if (this.player.dead) {
            this.gameOver();
        }
    }

    draw() {
        const { ctx, canvas } = this;
        const { width, height } = canvas;

        this.background.draw(ctx, width, height, this.speed);
        this.road.draw(ctx, width, height);
        this.obstacles.draw(ctx, this.road, width, height);
        this.coins.draw(ctx, this.road, width, height);
        this.powerUps.draw(ctx, this.road, width, height);
        this.particles.draw(ctx);
        this.player.draw(ctx);
    }

    _updateFps(dt) {
        this._fpsAccum += dt;
        this._fpsFrames++;
        if (this._fpsAccum >= 0.5) {
            this.fps = this._fpsFrames / this._fpsAccum;
            this._fpsAccum = 0;
            this._fpsFrames = 0;
        }
    }

    tick(now) {
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;

        this._updateFps(dt);
        this.update(dt);
        this.draw();

        if (this.state !== "menu") {
            this.ui.updateHUD({
                score: this.score,
                coins: this.sessionCoins,
                speed: this.getEffectiveSpeed() / 100,
                fps: this.fps,
                powerUps: this.powerUps.getActiveEffects(),
            });
        }
    }

    start() {
        this.ui.setState("menu");
        this.input.setGameplayEnabled(false);
        this.lastTime = performance.now();

        const groundY = this.getGroundY();
        const laneX = this.road.getLaneX(1, groundY, this.canvas.width, this.canvas.height);
        this.player.reset(laneX, groundY);
        this.player.state = "idle";

        const loop = (now) => {
            this.tick(now);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    destroy() {
        this.input.destroy();
        this.sound.stopBackground();
    }
}
