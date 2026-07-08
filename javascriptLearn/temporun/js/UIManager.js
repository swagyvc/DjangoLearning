/**
 * DOM overlay management for menus, HUD, and game state screens.
 */

const POWERUP_ICONS = {
    shield: "🛡",
    magnet: "M",
    doubleScore: "2x",
    speedBoost: "»",
};

export class UIManager {
    constructor() {
        this.menu = document.getElementById("menu");
        this.pause = document.getElementById("pause");
        this.gameover = document.getElementById("gameover");
        this.hud = document.getElementById("hud");

        this.scoreEl = document.getElementById("hud-score");
        this.coinsEl = document.getElementById("hud-coins");
        this.speedEl = document.getElementById("hud-speed");
        this.fpsEl = document.getElementById("hud-fps");
        this.finalScoreEl = document.getElementById("gameover-score");
        this.finalCoinsEl = document.getElementById("gameover-coins");
        this.highScoreEl = document.getElementById("gameover-highscore");
        this.powerupBar = document.getElementById("hud-powerups");

        this.playBtn = document.getElementById("btn-play");
        this.resumeBtn = document.getElementById("btn-resume");
        this.restartBtn = document.getElementById("btn-restart");
        this.pauseBtn = document.getElementById("btn-pause");
        this.muteBtn = document.getElementById("btn-mute");

        this._onPlay = null;
        this._onResume = null;
        this._onRestart = null;
        this._onPause = null;
        this._onMuteToggle = null;

        this.playBtn?.addEventListener("click", () => this._onPlay?.());
        this.resumeBtn?.addEventListener("click", () => this._onResume?.());
        this.restartBtn?.addEventListener("click", () => this._onRestart?.());
        this.pauseBtn?.addEventListener("click", () => this._onPause?.());
        this.muteBtn?.addEventListener("click", () => this._onMuteToggle?.());
    }

    onPlay(callback) { this._onPlay = callback; }
    onResume(callback) { this._onResume = callback; }
    onRestart(callback) { this._onRestart = callback; }
    onPause(callback) { this._onPause = callback; }
    onMuteToggle(callback) { this._onMuteToggle = callback; }

    setState(state) {
        this.menu?.classList.toggle("hidden", state !== "menu");
        this.pause?.classList.toggle("hidden", state !== "paused");
        this.gameover?.classList.toggle("hidden", state !== "gameover");
        this.hud?.classList.toggle("hidden", state === "menu");
    }

    setMuted(muted) {
        if (this.muteBtn) {
            this.muteBtn.textContent = muted ? "🔇" : "🔊";
            this.muteBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
        }
    }

    updateHUD({ score, coins, speed, fps, powerUps = [] }) {
        if (this.scoreEl) this.scoreEl.textContent = Math.floor(score);
        if (this.coinsEl) this.coinsEl.textContent = coins;
        if (this.speedEl) this.speedEl.textContent = speed.toFixed(1);
        if (this.fpsEl) this.fpsEl.textContent = Math.round(fps);

        if (this.powerupBar) {
            if (powerUps.length === 0) {
                this.powerupBar.innerHTML = "";
            } else {
                this.powerupBar.innerHTML = powerUps
                    .map(
                        (pu) =>
                            `<span class="powerup-badge" title="${pu.label}">` +
                            `${POWERUP_ICONS[pu.type] ?? "?"} ` +
                            `<span class="powerup-timer">${Math.ceil(pu.remaining)}s</span></span>`
                    )
                    .join("");
            }
        }
    }

    showGameOver(score, coins, highScore) {
        if (this.finalScoreEl) this.finalScoreEl.textContent = Math.floor(score);
        if (this.finalCoinsEl) this.finalCoinsEl.textContent = coins;
        if (this.highScoreEl) this.highScoreEl.textContent = Math.floor(highScore);
    }
}
