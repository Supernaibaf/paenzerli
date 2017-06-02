/**
 * Created by reiem on 12.05.2017.
 */

const constant = require('./const');

class Tank {
    constructor(index, x, y) {
        this.index = index;
        this.x = x;
        this.maxLeft = this.x - constant.MAX_DRIVE_DISTANCE;
        this.maxRight = this.x + constant.MAX_DRIVE_DISTANCE;
        this.y = y;
        this.life = 100;
        this.strength = constant.DEFAULT_STRENGTH;
        this.angle = Math.random() * Math.PI;
        this.weaponAmounts = {};
        this.currentWeapon = constant.DEFAULT_WEAPON;
        for (let key in constant.WEAPONS) {
            if (constant.WEAPONS.hasOwnProperty(key)) {
                this.weaponAmounts[key] = constant.WEAPONS[key].defaultAmount;
            }
        }
        this.mode = "fire";
    }

    setAngle(value) {
        this.angle = value;
        if (this.angle > Math.PI) {
            this.angle = Math.PI;
        } else if (this.angle < 0) {
            this.angle = 0;
        }
    }

    setStrength(value) {
        this.strength = value;
        if (this.strength > constant.MAX_STRENGTH) {
            this.strength = constant.MAX_STRENGTH;
        } else if (this.strength < 0) {
            this.strength = 0;
        }
    }

    setPosition(x, yPoints) {
        if (this.x == x * 10) {
            this.setMode("fire");
        } else {
            this.setMode("drive");
            this.x = x * 10;
            if (this.x >= this.maxRight) {
                this.x = this.maxRight;
            } else if (this.x <= this.maxLeft) {
                this.x = this.maxLeft;
            }
            this.y = yPoints[Math.floor(this.x / 10)];
            this.maxLeft = this.x - constant.MAX_DRIVE_DISTANCE;
            this.maxRight = this.x + constant.MAX_DRIVE_DISTANCE;
        }
    }

    setWeapon(value) {
        if (this.weaponAmounts.hasOwnProperty(value)) {
            this.currentWeapon = value;
            if (this.weaponAmounts[this.currentWeapon] <= 0) {
                return this.setWeapon(constant.WEAPONS[this.currentWeapon].empty);
            }
            return true;
        } else {
            return false;
        }
    }

    getWeapon() {
        return this.currentWeapon;
    }

    setPlayer(value) {
        this.player = value;
    }

    getPlayer() {
        return this.player;
    }

    setMode(value) {
        this.mode = value;
    }

    hit(life) {
        this.life -= life;
        return this.life;
    }

    simulateShot(landscapePoints, allTanks) {
        let speedX = this.strength * Math.cos(this.angle);
        let speedY = this.strength * Math.sin(this.angle);
        let cannonballStartX = this.x + (25 + constant.CANNONBALL_RADIUS) * Math.cos(this.angle);
        let cannonballStartY = this.y - (25 + constant.CANNONBALL_RADIUS) * Math.sin(this.angle);
        let groundhit = null;
        let groundhitY = null;
        let direction = (speedX >= 0) ? 1 : -1;
        let hits = [];
        let start = Math.floor(cannonballStartX / 10) + ((speedX >= 0) ? 1 : 0);

        let inWallShot = false;

        for (let i = start; (speedX >= 0) ? i <= constant.WIDTH / 10 : i >= 0; i += direction) {
            let time = ((i * 10) - cannonballStartX) / (constant.PIXEL_PER_METER * speedX);
            let y = cannonballStartY - constant.PIXEL_PER_METER * (speedY * time - (constant.ACCELERATION / 2) * time * time);
            if (y >= landscapePoints[i]) {
                groundhit = i * 10;
                groundhitY = landscapePoints[i];
                break;
            }
        }
        if (groundhit === null) {
            groundhit = (speedX >= 0) ? constant.WIDTH : 0;
        }

        if (groundhit >= this.x - 24 && groundhit <= this.x + 24) {
            hits.push(this.index);
        }

        if (!inWallShot) {
            for (let key in allTanks) {
                if (allTanks.hasOwnProperty(key) && key !== this.index) {
                    if ((speedX >= 0 && allTanks[key].x + 24 >= cannonballStartX && allTanks[key].x - 24 <= groundhit)
                        || (speedX < 0 && allTanks[key].x - 24 <= cannonballStartX && allTanks[key].x + 24 >= groundhit)) {


                        let time1 = (((allTanks[key].x - 24)) - cannonballStartX) / (constant.PIXEL_PER_METER * speedX);
                        let y1 = cannonballStartY - constant.PIXEL_PER_METER * (speedY * time1 - (constant.ACCELERATION / 2) * time1 * time1);
                        let time2 = (((allTanks[key].x + 24)) - cannonballStartX) / (constant.PIXEL_PER_METER * speedX);
                        let y2 = cannonballStartY - constant.PIXEL_PER_METER * (speedY * time2 - (constant.ACCELERATION / 2) * time2 * time2);

                        let m = (y2 - y1) / 48;
                        let b = y1 - m * (allTanks[key].x - 24);
                        let x = (allTanks[key].y - b) / m;

                        if ((time1 > 0 && y1 >= allTanks[key].y - 12 && y1 <= allTanks[key].y + 18)
                            || (time2 > 0 && y2 >= allTanks[key].y - 12 && y2 <= allTanks[key].y + 18)
                            || (time1 > 0 && time2 > 0 && x >= allTanks[key].x - 24 && x <= allTanks[key].x + 24)) {
                            hits.push(allTanks[key].index);
                            groundhit = allTanks[key].x;
                            groundhitY = allTanks[key].y;
                        }
                    }
                }
            }
        }

        this.weaponAmounts[this.currentWeapon]--;
        if (this.weaponAmounts[this.currentWeapon] <= 0) {
            this.setWeapon(this.currentWeapon);
        }
        return {
            "hits": hits,
            "stopX": groundhit,
            "stopY": groundhitY
        };

    }

    getObject() {
        return {
            index: this.index,
            x: this.x,
            y: this.y,
            life: this.life,
            angle: this.angle,
            strength: this.strength,
            mode: this.mode,
            weapon: this.currentWeapon
        }
    }
}

module.exports = Tank;
