/**
 * Shared math helpers and object pooling for game entities.
 */

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

/** Scale a per-frame (60fps) rate to be delta-time independent. */
export function dtScale(dt, ratePerFrame = 1) {
    return 1 - Math.pow(1 - ratePerFrame, dt * 60);
}

/**
 * Reusable object pool — acquire/release without array splice churn.
 */
export class ObjectPool {
    constructor(factory, initialSize = 16) {
        this._factory = factory;
        this._pool = [];
        this.active = [];

        for (let i = 0; i < initialSize; i++) {
            this._pool.push(factory());
        }
    }

    acquire() {
        const obj = this._pool.length > 0 ? this._pool.pop() : this._factory();
        this.active.push(obj);
        return obj;
    }

    release(obj) {
        const idx = this.active.indexOf(obj);
        if (idx !== -1) {
            this.active.splice(idx, 1);
        }
        this._pool.push(obj);
    }

    releaseAll() {
        while (this.active.length > 0) {
            this._pool.push(this.active.pop());
        }
    }

    forEachActive(callback) {
        for (const obj of this.active) {
            callback(obj);
        }
    }
}
