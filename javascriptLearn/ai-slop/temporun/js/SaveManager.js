const KEYS = {
    HIGH_SCORE: "jungleRunner_highScore",
    TOTAL_COINS: "jungleRunner_totalCoins",
    SETTINGS: "jungleRunner_settings",
};

const DEFAULT_SETTINGS = {
    muted: false,
};

export class SaveManager {
    constructor() {
        this.settings = this._loadSettings();
    }

    _loadSettings() {
        try {
            const raw = localStorage.getItem(KEYS.SETTINGS);
            if (raw) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
            }
        } catch {
            /* ignore corrupt data */
        }
        return { ...DEFAULT_SETTINGS };
    }

    saveSettings() {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(this.settings));
    }

    getHighScore() {
        return parseInt(localStorage.getItem(KEYS.HIGH_SCORE) || "0", 10);
    }

    saveHighScore(score) {
        const current = this.getHighScore();
        const floored = Math.floor(score);
        if (floored > current) {
            localStorage.setItem(KEYS.HIGH_SCORE, String(floored));
            return floored;
        }
        return current;
    }

    getTotalCoins() {
        return parseInt(localStorage.getItem(KEYS.TOTAL_COINS) || "0", 10);
    }

    addCoins(amount) {
        const total = this.getTotalCoins() + amount;
        localStorage.setItem(KEYS.TOTAL_COINS, String(total));
        return total;
    }

    isMuted() {
        return !!this.settings.muted;
    }

    setMuted(muted) {
        this.settings.muted = muted;
        this.saveSettings();
    }
}
