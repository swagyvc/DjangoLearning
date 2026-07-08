/**
 * Fake 3D perspective road using stacked trapezoid segments.
 */

const SEGMENT_COUNT = 24;
const HORIZON_RATIO = 0.22;
const BOTTOM_WIDTH_RATIO = 0.52;
const TOP_WIDTH_RATIO = 0.08;

export class RoadRenderer {
    constructor() {
        this.scrollOffset = 0;
        this.segmentSpacing = 0;
    }

    /**
     * Map a depth value (0 = horizon, 1 = bottom) to screen Y.
     */
    _depthToY(depth, height) {
        const horizonY = height * HORIZON_RATIO;
        return horizonY + depth * (height - horizonY);
    }

    /**
     * Road half-width at a given screen Y (perspective trapezoid).
     */
    getHalfWidthAtY(y, width, height) {
        const horizonY = height * HORIZON_RATIO;
        const t = clamp01((y - horizonY) / (height - horizonY));
        const bottomHalf = (width * BOTTOM_WIDTH_RATIO) / 2;
        const topHalf = (width * TOP_WIDTH_RATIO) / 2;
        return topHalf + (bottomHalf - topHalf) * t;
    }

    /**
     * X center for a lane (0, 1, 2) at a given screen Y.
     */
    getLaneX(lane, y, width, height) {
        const centerX = width / 2;
        const halfWidth = this.getHalfWidthAtY(y, width, height);
        const laneFraction = lane / 2;
        return centerX - halfWidth + laneFraction * halfWidth * 2;
    }

    update(dt, speed) {
        if (this.segmentSpacing <= 0) return;
        this.scrollOffset += speed * dt;
        if (this.scrollOffset >= this.segmentSpacing) {
            this.scrollOffset %= this.segmentSpacing;
        }
    }

    draw(ctx, width, height) {
        const centerX = width / 2;
        const horizonY = height * HORIZON_RATIO;
        const bottomHalf = (width * BOTTOM_WIDTH_RATIO) / 2;
        const topHalf = (width * TOP_WIDTH_RATIO) / 2;

        this.segmentSpacing = (height - horizonY) / SEGMENT_COUNT;

        // Road surface segments (back to front)
        for (let i = SEGMENT_COUNT - 1; i >= 0; i--) {
            const depthTop = i / SEGMENT_COUNT;
            const depthBottom = (i + 1) / SEGMENT_COUNT;

            let yTop = this._depthToY(depthTop, height);
            let yBottom = this._depthToY(depthBottom, height);

            yTop += this.scrollOffset;
            yBottom += this.scrollOffset;

            if (yBottom < horizonY || yTop > height) continue;

            const shade = 0.35 + depthBottom * 0.25;
            ctx.fillStyle = `rgb(${Math.floor(70 * shade)}, ${Math.floor(70 * shade)}, ${Math.floor(72 * shade)})`;

            const halfTop = topHalf + (bottomHalf - topHalf) * depthTop;
            const halfBottom = topHalf + (bottomHalf - topHalf) * depthBottom;

            ctx.beginPath();
            ctx.moveTo(centerX - halfTop, yTop);
            ctx.lineTo(centerX + halfTop, yTop);
            ctx.lineTo(centerX + halfBottom, yBottom);
            ctx.lineTo(centerX - halfBottom, yBottom);
            ctx.closePath();
            ctx.fill();
        }

        // Lane dividers (dashed, perspective)
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";

        for (let lane = 1; lane <= 2; lane++) {
            const laneFrac = lane / 3;

            for (let i = 0; i < SEGMENT_COUNT; i++) {
                const depthTop = i / SEGMENT_COUNT;
                const depthBottom = (i + 1) / SEGMENT_COUNT;

                let yTop = this._depthToY(depthTop, height) + this.scrollOffset;
                let yBottom = this._depthToY(depthBottom, height) + this.scrollOffset;

                if (yBottom < horizonY || yTop > height) continue;
                if (i % 2 === 0) continue;

                const halfTop = topHalf + (bottomHalf - topHalf) * depthTop;
                const halfBottom = topHalf + (bottomHalf - topHalf) * depthBottom;

                const xTop = centerX - halfTop + laneFrac * halfTop * 2;
                const xBottom = centerX - halfBottom + laneFrac * halfBottom * 2;

                const dashTop = yTop + (yBottom - yTop) * 0.15;
                const dashBottom = yTop + (yBottom - yTop) * 0.65;

                ctx.beginPath();
                ctx.moveTo(
                    xTop + (xBottom - xTop) * 0.15,
                    dashTop
                );
                ctx.lineTo(
                    xTop + (xBottom - xTop) * 0.65,
                    dashBottom
                );
                ctx.stroke();
            }
        }

        // Road edge lines
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(centerX - topHalf, horizonY);
        ctx.lineTo(centerX - bottomHalf, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + topHalf, horizonY);
        ctx.lineTo(centerX + bottomHalf, height);
        ctx.stroke();
    }
}

function clamp01(v) {
    return Math.max(0, Math.min(1, v));
}
