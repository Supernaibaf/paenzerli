/**
 * Created by reiem on 13.05.2017.
 */

class Tank {
    constructor(context, maintank, index, x, y, angle, strength, fireEnd) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.context = context;
        this.isMainTank = maintank;
        this.fireEnd = fireEnd;
        this.life = MAX_LIFE;
        this.cannonballInterval = null;
        this.cannonballStarttime = null;
        this.cannonballX = this.x;
        this.cannonballY = this.y;
        this.cannonballSpeedVertical = 0;
        this.cannonballSpeedHorizontal = 0;
        this.maxLeft = this.x - MAX_DRIVE_DISTANCE;
        this.maxRight = this.x + MAX_DRIVE_DISTANCE;
        this.isDead = false;
        if (maintank === true) {
            this.color = MY_COLOR;
            this.shotColor = MY_COLOR;
            this.mainColor = MY_COLOR;
            this.strengthBar = strengthSlider;
        } else {
            this.color = COLOR_OPPONENT;
            this.mainColor = COLOR_OPPONENT;
            this.shotColor = COLOR_SHOT;
        }
        this.weaponAmounts = {};
        for (let key in WEAPONS) {
            if (WEAPONS.hasOwnProperty(key)) {
                this.weaponAmounts[key] = WEAPONS[key].defaultAmount;
            }
        }
        this.setStrength(strength);
    }

    getAmounts() {
        return this.weaponAmounts;
    }

    getIndex() {
        return this.index;
    }

    setShot() {
        this.color = this.shotColor;
        this.draw();
    }

    resetShot() {
        this.color = this.mainColor;
        this.draw();
    }

    tankHit(life) {
        if (this.life > 0) {
            this.life -= life;
            this.draw();
        }
        if (this.life <= 0 && !this.isDead) {
            this.setDead();
            this.animateDead();
        }
    }

    setDead() {
        this.isDead = true;
        if (this.isMainTank && this.rank === null) {
            finishMyGame();
        }
    }

    animateDead() {
        let animationRadius = 0;
        let animationInterval = setInterval((function() {
            animationRadius += 2;
            this.context.beginPath();
            this.context.arc(this.x, this.y, animationRadius, 0, 2 * Math.PI);
            this.context.fillStyle = BACKGROUND_COLOR;
            this.context.closePath();
            this.context.fill();
            if (animationRadius >= 28) {
                clearInterval(animationInterval);
            }
        }).bind(this), 1000 / FPS);
    }

    setCannonball() {
        let time = ((Date.now()) - this.cannonballStarttime) / 1000;
        this.clearCannonball();
        this.cannonballX = this.cannonballStartX + PIXEL_PER_METER * (this.speedX * time);
        this.cannonballY = this.cannonballStartY - PIXEL_PER_METER * (this.speedY * time - (ACCELERATION / 2) * time * time);
        if ((this.speedX >= 0 && this.cannonballX >= this.shot.stop)
            || (this.speedX < 0 && this.cannonballX <= this.shot.stop)
            || this.cannonballY > landscape.points[Math.floor(this.cannonballX / 10)]) {

            for (let i = 0; i < this.shot.hits.length; i++) {
                allTanks[this.shot.hits[i]].tankHit(WEAPONS[this.weapon].strength);
            }

            clearInterval(this.cannonballInterval);
            this.cannonballInterval = null;
            this.shot = null;
            this.weaponAmounts[this.weapon]--;
            this.fireEnd();
        } else {
            this.drawCannonball();
        }
    }

    drawCannonball() {
        let img = new Image();
        img.src = WEAPONS[this.weapon].img;
        this.context.drawImage(img, this.cannonballX - CANNONBALL_RADIUS * 3, this.cannonballY - CANNONBALL_RADIUS * 3, CANNONBALL_RADIUS * 6, CANNONBALL_RADIUS * 6);
        this.draw();
        /*this.context.beginPath();
        this.context.arc(this.cannonballX, this.cannonballY, CANNONBALL_RADIUS, 0, 2 * Math.PI);
        this.context.fillStyle = WEAPONS[this.weapon].color;

        this.context.fill();*/
    }

    clearCannonball() {
        /*this.context.fillRect();
        this.context.beginPath();
        this.context.arc(this.cannonballX, this.cannonballY, CANNONBALL_RADIUS + 1, 0, 2 * Math.PI);
        this.context.fillStyle = BACKGROUND_COLOR;
        this.context.fill();*/
        this.context.fillStyle = BACKGROUND_COLOR;
        this.context.fillRect(this.cannonballX - CANNONBALL_RADIUS * 3, this.cannonballY - CANNONBALL_RADIUS * 3, CANNONBALL_RADIUS * 6, CANNONBALL_RADIUS * 6);
    }

    fire(shot) {
        if (this.cannonballInterval === null && !this.isDead) {
            this.shot = shot;
            this.speedX = this.strength * Math.cos(this.angle);
            this.speedY = this.strength * Math.sin(this.angle);
            this.cannonballStarttime = Date.now();
            this.cannonballStartX = this.x + (25 + CANNONBALL_RADIUS) * Math.cos(this.angle);
            this.cannonballStartY = this.y - (25 + CANNONBALL_RADIUS) * Math.sin(this.angle);
            this.cannonballX = this.cannonballStartX;
            this.cannonballY = this.cannonballStartY;
            this.cannonballInterval = window.setInterval(this.setCannonball.bind(this), 1000 / FPS);
        }
    }

    hasFired() {
        return this.shot === null;
    }

    checkForHit(posX) {
        return (posX <= this.x + 24 && posX >= this.x - 24);
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
        if (this.isMainTank) {
            this.strengthBar.style.left = (100 * this.strength / MAX_STRENGTH) + "%";
        }
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
        this.setStrength(this.strength);
        redrawPlayground();
    }

    setPosition(x, operator) {
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
        this.y = landscape.points[Math.floor(this.x / 10)] + DELTA_Y;
        redrawPlayground();
    }

    setWeapon(value) {
        this.weapon = value;
    }

    getWeapon() {
        return this.weapon;
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
        redrawPlayground();
    }

    draw() {
        if (!this.isDead) {
            //redrawPlayground();
            let pipeEndX = 24 * Math.cos(this.angle);
            let pipeEndY = -24 * Math.sin(this.angle);
            let lifeWidth = (36 / 100) * this.life - 18;
            /*this.context.beginPath();
            this.context.rect(this.x - 25, this.y - 25, 50, 30);
            this.context.fillStyle = BACKGROUND_COLOR;
            this.context.fill();*/
            this.context.beginPath();
            this.context.lineTo(this.x, this.y);
            this.context.lineTo(this.x + pipeEndX, this.y + pipeEndY);
            this.context.strokeStyle = "#000000";
            this.context.lineWidth = 8;
            this.context.stroke();
            this.context.beginPath();
            this.context.arc(this.x, this.y, 12, 0, 2 * Math.PI);
            this.context.fillStyle = this.color;
            this.context.closePath();
            this.context.fill();
            this.context.beginPath();
            this.context.lineTo(this.x, this.y);
            this.context.lineTo(this.x + 18, this.y);
            this.context.lineTo(this.x + 24, this.y + 6);
            this.context.lineTo(this.x + 24, this.y + 12);
            this.context.lineTo(this.x + 18, this.y + 18);
            this.context.lineTo(this.x - 18, this.y + 18);
            this.context.lineTo(this.x - 24, this.y + 12);
            this.context.lineTo(this.x - 24, this.y + 6);
            this.context.lineTo(this.x - 18, this.y);
            this.context.lineTo(this.x, this.y);
            this.context.closePath();
            this.context.fillStyle = "#555555";
            this.context.fill();
            this.context.beginPath();
            this.context.lineTo(this.x - 18, this.y + 6);
            this.context.lineTo(this.x + lifeWidth, this.y + 6);
            this.context.lineTo(this.x + lifeWidth, this.y + 12);
            this.context.lineTo(this.x - 18, this.y + 12);
            this.context.closePath();
            this.context.fillStyle = "#ff0000";
            this.context.fill();
        }
    }

    getObject() {
        return {
            "index": this.index,
            "angle": this.angle,
            "strength": this.strength,
            "x": this.x,
            "y": this.y,
            "weapon": this.weapon
        };
    }
}
