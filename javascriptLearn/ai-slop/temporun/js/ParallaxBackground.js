/**
 * Procedural parallax background layers (no image assets).
 */

export class ParallaxBackground {
    constructor() {
        this.scroll = 0;
        this._clouds = this._generateClouds(8);
        this._trees = this._generateTrees(12);
    }

    _generateClouds(count) {
        const clouds = [];
        for (let i = 0; i < count; i++) {
            clouds.push({
                x: Math.random(),
                y: 0.05 + Math.random() * 0.2,
                w: 60 + Math.random() * 80,
                h: 30 + Math.random() * 20,
                speed: 0.8 + Math.random() * 0.4,
            });
        }
        return clouds;
    }

    _generateTrees(count) {
        const trees = [];
        for (let i = 0; i < count; i++) {
            trees.push({
                side: i % 2 === 0 ? -1 : 1,
                x: Math.random(),
                scale: 0.6 + Math.random() * 0.8,
            });
        }
        return trees;
    }

    update(dt, gameSpeed) {
        this.scroll += gameSpeed * dt;
    }

    draw(ctx, width, height, gameSpeed) {
        this._drawSky(ctx, width, height);
        this._drawSun(ctx, width, height);
        this._drawClouds(ctx, width, height, gameSpeed);
        this._drawMountains(ctx, width, height);
        this._drawTrees(ctx, width, height);
        this._drawGround(ctx, width, height);
    }

    _drawSky(ctx, width, height) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "#4a90c8");
        gradient.addColorStop(0.55, "#87ceeb");
        gradient.addColorStop(1, "#5a9e4a");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    _drawSun(ctx, width, height) {
        const sunX = width * 0.78;
        const sunY = height * 0.14;
        const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 70);
        glow.addColorStop(0, "rgba(255, 230, 120, 0.9)");
        glow.addColorStop(0.5, "rgba(255, 220, 80, 0.3)");
        glow.addColorStop(1, "rgba(255, 220, 80, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFE566";
        ctx.beginPath();
        ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawClouds(ctx, width, height, gameSpeed) {
        const layerScroll = this.scroll * 0.2 * 0.2;

        for (const cloud of this._clouds) {
            const x = ((cloud.x * width * 1.4 - layerScroll * cloud.speed) % (width * 1.4)) - width * 0.2;
            const y = cloud.y * height;

            ctx.fillStyle = "rgba(255,255,255,0.75)";
            ctx.beginPath();
            ctx.ellipse(x, y, cloud.w * 0.5, cloud.h * 0.5, 0, 0, Math.PI * 2);
            ctx.ellipse(x + cloud.w * 0.3, y - cloud.h * 0.2, cloud.w * 0.4, cloud.h * 0.45, 0, 0, Math.PI * 2);
            ctx.ellipse(x + cloud.w * 0.55, y, cloud.w * 0.35, cloud.h * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawMountains(ctx, width, height) {
        const baseY = height * 0.55;
        const layerScroll = (this.scroll * 0.3 * 0.15) % width;

        const peaks = [
            { x: 0, h: 0.22 },
            { x: 0.2, h: 0.28 },
            { x: 0.42, h: 0.18 },
            { x: 0.62, h: 0.32 },
            { x: 0.85, h: 0.24 },
            { x: 1.05, h: 0.2 },
        ];

        ctx.fillStyle = "#3d6b4f";
        ctx.beginPath();
        ctx.moveTo(-layerScroll, baseY);
        for (const peak of peaks) {
            const px = peak.x * width - layerScroll;
            ctx.lineTo(px, baseY - peak.h * height);
        }
        ctx.lineTo(width - layerScroll, baseY);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#2d5a3e";
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - layerScroll, baseY);
        for (let i = 0; i < peaks.length; i++) {
            const peak = peaks[(i + 2) % peaks.length];
            const px = (peak.x + 0.15) * width - layerScroll * 0.7;
            ctx.lineTo(px, baseY - peak.h * height * 0.85);
        }
        ctx.lineTo(width, baseY);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
    }

    _drawTrees(ctx, width, height) {
        const roadHalf = width * 0.26;
        const baseY = height * 0.72;
        const layerScroll = this.scroll * 0.5 * 0.25;

        for (const tree of this._trees) {
            const tx = tree.side < 0
                ? width / 2 - roadHalf - 40 - (tree.x * width * 0.35 + layerScroll * 0.1) % (width * 0.4)
                : width / 2 + roadHalf + 40 + (tree.x * width * 0.35 + layerScroll * 0.1) % (width * 0.4);

            const s = tree.scale;
            const trunkW = 12 * s;
            const trunkH = 40 * s;
            const crownR = 28 * s;

            ctx.fillStyle = "#5c3d1e";
            ctx.fillRect(tx - trunkW / 2, baseY - trunkH, trunkW, trunkH);

            ctx.fillStyle = "#2d7a32";
            ctx.beginPath();
            ctx.moveTo(tx, baseY - trunkH - crownR * 1.4);
            ctx.lineTo(tx - crownR, baseY - trunkH);
            ctx.lineTo(tx + crownR, baseY - trunkH);
            ctx.closePath();
            ctx.fill();
        }
    }

    _drawGround(ctx, width, height) {
        const roadHalf = width * 0.26;
        const grassTop = height * 0.72;
        const layerScroll = this.scroll * 0.7 * 0.3;

        ctx.fillStyle = "#4a8f3a";
        ctx.fillRect(0, grassTop, width / 2 - roadHalf, height - grassTop);
        ctx.fillRect(width / 2 + roadHalf, grassTop, width / 2 - roadHalf, height - grassTop);

        ctx.strokeStyle = "#3d7a30";
        ctx.lineWidth = 2;
        const stripSpacing = 40;
        const offset = layerScroll % stripSpacing;

        for (let y = grassTop + offset; y < height; y += stripSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width / 2 - roadHalf, y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(width / 2 + roadHalf, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
}
