/**
 * Created by reiem on 30.05.2017.
 */

const Tank = class Tank {
    constructor(tankObject) {
        this.index = tankObject.index;
        this.x = tankObject.x;
        this.y = tankObject.y;
        this.angle = tankObject.angle;
        this.strength = tankObject.strength;
        this.weapon = tankObject.weapon;
        this.life = tankObject.life;
        this.color = tankObject.color;
        this.maxLeft = this.x - MAX_DRIVE_DISTANCE;
        this.maxRight = this.x + MAX_DRIVE_DISTANCE;
        this.weaponAmounts = {};
        for (let key in WEAPONS) {
            if (WEAPONS.hasOwnProperty(key)) {
                this.weaponAmounts[key] = WEAPONS[key].defaultAmount;
            }
        }
    }

    getIndex() {
        return this.index;
    }

    setPositionX(x, operator) {
        if (operator === undefined) {
            this.x = x;
            this.maxLeft = this.x - MAX_DRIVE_DISTANCE;
            this.maxRight = this.x + MAX_DRIVE_DISTANCE;
        } else if (operator === "add") {
            this.x += x * 10;
        } else if (operator === "sub") {
            this.x -= x * 10;
        }
        if (this.x >= WIDTH) {
            this.x = WIDTH;
        } else if (this.x <= 0) {
            this.x = 0;
        } else if (this.x >= this.maxRight) {
            this.x = this.maxRight;
        } else if (this.x <= this.maxLeft) {
            this.x = this.maxLeft;
        }
        return this.x;
    }

    getPositionX() {
        return this.x;
    }

    setPositionY(y) {
        this.y = y;
    }

    setStrength(strength, operator) {
        if (operator === undefined) {
            this.strength = strength;
        } else if (operator === "add") {
            this.strength += strength;
        } else if (operator === "sub") {
            this.strength -= strength;
        }
        if (this.strength > MAX_STRENGTH) {
            this.strength = MAX_STRENGTH;
        } else if (this.strength < 0) {
            this.strength = 0;
        }
        return this.strength;
    }

    setAngle(angle, operator) {
        if (operator === undefined) {
            this.angle = angle;
        } else if (operator === "add") {
            this.angle += angle;
        } else if (operator === "sub") {
            this.angle -= angle;
        }
        if (this.angle > Math.PI) {
            this.angle = Math.PI;
        } else if (this.angle < 0) {
            this.angle = 0;
        }
        return this.angle;
    }

    getAngle() {
        return this.angle;
    }

    setLife(life, operator) {
        if (operator === undefined) {
            this.life = life;
        } else if (operator === "add") {
            this.life += life;
        } else if (operator === "sub") {
            this.life -= life;
        }
        if (this.life > MAX_LIFE) {
            this.life = MAX_LIFE;
        } else if (this.life < 0) {
            this.life = 0;
        }
        return this.life;
    }

    setColor(color) {
        this.color = color;
    }

    setWeapon(weapon) {
        if (this.weaponAmounts[weapon] <= 0) {
            return this.setWeapon(WEAPONS[weapon].empty);
        }
        this.weapon = weapon;
        return {
            "name": this.weapon,
            "amount": this.weaponAmounts[this.weapon]
        }
    }

    getAmounts() {
        return this.weaponAmounts;
    }

    followMouse(mouseX, mouseY) {
        let distX = mouseX - this.x;
        let distY = mouseY - this.y;
        if (mouseY >= this.y) {
            if (mouseX >= this.x) {
                this.angle = 0;
            } else {
                this.angle = Math.PI;
            }
        } else {
            if (mouseX >= this.x) {
                this.angle = -Math.atan(distY / distX);
            } else {
                this.angle = Math.PI - Math.atan(distY / distX);
            }
        }
    }

    shot() {
        this.weaponAmounts[this.weapon]--;
        return this.setWeapon(this.weapon);
    }

    getObject() {
        return {
            "index": this.index,
            "angle": this.angle,
            "strength": this.strength,
            "x": this.x,
            "y": this.y,
            "life": this.life,
            "weapon": this.weapon,
            "color": this.color
        };
    }
};
