/**
 * AABB collision with jump-over, slide-under, and shield rules.
 */

const COLLISION_Y_MARGIN = 30;

function aabbOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function getPlayerBox(player) {
    return {
        x: player.x - player.width / 2,
        y: player.y,
        width: player.width,
        height: player.height,
    };
}

function canAvoidObstacle(player, obstacle, obsBounds) {
    if (obstacle.slideUnder && player.sliding) {
        return true;
    }

    if (obstacle.jumpOver && player.jumping) {
        const playerBottom = player.y + player.height;
        const obstacleTop = obsBounds.y + obsBounds.height * 0.25;
        if (playerBottom <= obstacleTop + 8) {
            return true;
        }
    }

    if (player.jumping && !obstacle.wide) {
        const clearance = player.y + player.height * 0.6;
        if (clearance < obsBounds.y + obsBounds.height * 0.4) {
            return true;
        }
    }

    return false;
}

function isInCollisionZone(obsBounds, playerGroundY) {
    const zoneTop = playerGroundY - COLLISION_Y_MARGIN - 80;
    const zoneBottom = playerGroundY + COLLISION_Y_MARGIN;
    const obsCenterY = obsBounds.y + obsBounds.height / 2;
    return obsCenterY >= zoneTop && obsCenterY <= zoneBottom;
}

export class CollisionSystem {
    /**
     * @returns {{ hit: boolean, shieldUsed?: boolean, obstacle?: object }}
     */
    static checkObstacles(player, obstacles, obstacleManager, road, width, height, hasShield) {
        const playerBox = getPlayerBox(player);

        for (const obs of obstacles) {
            const bounds = obstacleManager.getScreenBounds(obs, road, width, height);
            if (!isInCollisionZone(bounds, player.groundY)) continue;
            if (!aabbOverlap(playerBox, bounds)) continue;
            if (canAvoidObstacle(player, obs, bounds)) continue;

            if (player.invulnerable || player.dead) {
                return { hit: false };
            }

            if (hasShield) {
                player.activateInvulnerability();
                return { hit: true, shieldUsed: true, obstacle: obs };
            }

            player.die();
            return { hit: true, shieldUsed: false, obstacle: obs };
        }

        return { hit: false };
    }

    /**
     * @returns {object[]} collected coins
     */
    static checkCoins(player, coins, coinManager, road, width, height) {
        const playerBox = getPlayerBox(player);
        const collected = [];

        for (const coin of coins) {
            const bounds = coinManager.getScreenBounds(coin, road, width, height);
            if (!isInCollisionZone(bounds, player.groundY)) continue;

            const cx = bounds.centerX;
            const cy = bounds.centerY;
            const px = player.x;
            const py = player.y + player.height / 2;
            const dist = Math.hypot(cx - px, cy - py);
            const collectRadius = bounds.radius + player.width * 0.35;

            if (dist < collectRadius || aabbOverlap(playerBox, bounds)) {
                collected.push(coin);
            }
        }

        return collected;
    }

    /**
     * @returns {object|null} collected power-up
     */
    static checkPowerUps(player, powerUps, powerUpManager, road, width, height) {
        const playerBox = getPlayerBox(player);

        for (const pu of powerUps) {
            const bounds = powerUpManager.getScreenBounds(pu, road, width, height);
            if (!isInCollisionZone(bounds, player.groundY)) continue;

            if (aabbOverlap(playerBox, bounds)) {
                return pu;
            }
        }

        return null;
    }
}
