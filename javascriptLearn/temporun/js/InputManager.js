/**
 * Keyboard and touch-swipe input with per-frame action queue.
 */

const SWIPE_THRESHOLD = 40;
const SWIPE_MAX_TIME = 400;

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this._keys = new Set();
        this._actions = [];
        this._touchStart = null;
        this.enabled = true;
        this.gameplayEnabled = true;

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);

        document.addEventListener("keydown", this._onKeyDown);
        document.addEventListener("keyup", this._onKeyUp);
        canvas.addEventListener("touchstart", this._onTouchStart, { passive: true });
        canvas.addEventListener("touchend", this._onTouchEnd, { passive: true });
    }

    destroy() {
        document.removeEventListener("keydown", this._onKeyDown);
        document.removeEventListener("keyup", this._onKeyUp);
        this.canvas.removeEventListener("touchstart", this._onTouchStart);
        this.canvas.removeEventListener("touchend", this._onTouchEnd);
    }

    setGameplayEnabled(enabled) {
        this.gameplayEnabled = enabled;
    }

    _pushAction(action) {
        if (!this.enabled) return;
        this._actions.push(action);
    }

    _onKeyDown(e) {
        const key = e.key.toLowerCase();
        if (this._keys.has(key)) return;
        this._keys.add(key);

        if (key === "p") {
            this._pushAction("pause");
            return;
        }

        if (key === "r") {
            this._pushAction("restart");
            return;
        }

        if (!this.gameplayEnabled) return;

        switch (key) {
            case "arrowleft":
            case "a":
                this._pushAction("left");
                break;
            case "arrowright":
            case "d":
                this._pushAction("right");
                break;
            case " ":
            case "w":
            case "arrowup":
                e.preventDefault();
                this._pushAction("jump");
                break;
            case "arrowdown":
            case "s":
                this._pushAction("slide");
                break;
        }
    }

    _onKeyUp(e) {
        this._keys.delete(e.key.toLowerCase());
    }

    _onTouchStart(e) {
        if (!this.enabled || e.touches.length === 0) return;
        const touch = e.touches[0];
        this._touchStart = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        };
    }

    _onTouchEnd(e) {
        if (!this.enabled || !this._touchStart || !this.gameplayEnabled) {
            this._touchStart = null;
            return;
        }

        const touch = e.changedTouches[0];
        const dx = touch.clientX - this._touchStart.x;
        const dy = touch.clientY - this._touchStart.y;
        const elapsed = Date.now() - this._touchStart.time;
        this._touchStart = null;

        if (elapsed > SWIPE_MAX_TIME) return;

        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) return;

        if (absX > absY) {
            this._pushAction(dx > 0 ? "right" : "left");
        } else {
            this._pushAction(dy > 0 ? "slide" : "jump");
        }
    }

    /** Consume and return all actions queued this frame. */
    consumeActions() {
        const actions = this._actions;
        this._actions = [];
        return actions;
    }

    isKeyDown(key) {
        return this._keys.has(key.toLowerCase());
    }
}
