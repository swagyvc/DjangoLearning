/**
 * Procedural sounds via Web Audio API — no external asset files.
 */

export class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this._bgOsc = null;
        this._bgGain = null;
        this._bgStarted = false;
    }

    _ensureContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return null;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }
        return this.ctx;
    }

    setMuted(muted) {
        this.muted = muted;
        if (this._bgGain) {
            this._bgGain.gain.value = muted ? 0 : 0.04;
        }
        if (muted && this._bgOsc) {
            this.stopBackground();
        }
    }

    _playTone({ freq, duration, type = "square", volume = 0.15, freqEnd, attack = 0.01, decay = 0.1 }) {
        if (this.muted) return;
        const ctx = this._ensureContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (freqEnd) {
            osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
        }

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + attack);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration + decay);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + decay + 0.05);
    }

    playJump() {
        this._playTone({ freq: 320, freqEnd: 520, duration: 0.12, type: "sine", volume: 0.12 });
    }

    playCoin() {
        this._playTone({ freq: 880, duration: 0.08, type: "sine", volume: 0.1 });
        setTimeout(() => {
            if (!this.muted) {
                this._playTone({ freq: 1100, duration: 0.06, type: "sine", volume: 0.08 });
            }
        }, 50);
    }

    playCollision() {
        this._playTone({ freq: 120, freqEnd: 40, duration: 0.35, type: "sawtooth", volume: 0.2 });
    }

    playShieldHit() {
        this._playTone({ freq: 200, freqEnd: 400, duration: 0.15, type: "triangle", volume: 0.12 });
    }

    playPowerUp() {
        this._playTone({ freq: 440, freqEnd: 880, duration: 0.2, type: "sine", volume: 0.12 });
    }

    playMenuClick() {
        this._playTone({ freq: 600, duration: 0.06, type: "sine", volume: 0.1 });
    }

    playPause() {
        this._playTone({ freq: 500, freqEnd: 300, duration: 0.1, type: "triangle", volume: 0.08 });
    }

    startBackground() {
        if (this.muted || this._bgStarted) return;
        const ctx = this._ensureContext();
        if (!ctx) return;

        this._bgOsc = ctx.createOscillator();
        this._bgGain = ctx.createGain();
        this._bgOsc.type = "sine";
        this._bgOsc.frequency.value = 110;
        this._bgGain.gain.value = 0.04;
        this._bgOsc.connect(this._bgGain);
        this._bgGain.connect(ctx.destination);
        this._bgOsc.start();
        this._bgStarted = true;
    }

    stopBackground() {
        if (this._bgOsc) {
            try {
                this._bgOsc.stop();
            } catch {
                /* already stopped */
            }
            this._bgOsc.disconnect();
            this._bgOsc = null;
            this._bgStarted = false;
        }
    }

    resume() {
        this._ensureContext();
    }
}
