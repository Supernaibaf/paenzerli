/**
 * Created by reiem on 13.05.2017.
 */

let playgroundDown = false;
let strengthSliderDown = false;

const inputmove = function inputmove(clientX, clientY, e) {
    if (playgroundDown) {
        let viewportOffset = playground.getBoundingClientRect();
        let mouseX = ((clientX - viewportOffset.left) / playground.clientWidth) * WIDTH;
        let mouseY = ((clientY - viewportOffset.top) / playground.clientHeight) * HEIGHT;
        myTank.followMouse(mouseX, mouseY);
        if (e !== undefined) {
            e.preventDefault();
        }
    } else if (strengthSliderDown) {
        let viewportOffset = strengthSlider.parentElement.getBoundingClientRect();
        let mouseX = clientX - viewportOffset.left;

        let strength;
        if (mouseX <= 0) {
            strength = 0;
        } else if (mouseX >= viewportOffset.width) {
            strength = MAX_STRENGTH;
        } else {
            strength = (mouseX / viewportOffset.width) * MAX_STRENGTH;
        }
        myTank.setStrength(strength);
        if (e !== undefined) {
            e.preventDefault();
        }
    }
};

const touchmove = function touchmove(e) {
    if (e.touches.length == 1) {
        inputmove(e.touches[0].clientX, e.touches[0].clientY, e);
    }
};

const mousemove = function mousemove(e) {
    inputmove(e.clientX, e.clientY);
};

const inputdown = function inputdown(target, clientX) {
    if (target == playground) {
        playgroundDown = true;
    } else if (target == strengthSlider) {
        strengthSliderDown = true;
    } else if (target == strengthbox) {
        strengthSliderDown = true;
        let viewportOffset = strengthbox.getBoundingClientRect();
        let mouseX = clientX - viewportOffset.left;

        let strength;
        strength = (mouseX / viewportOffset.width) * MAX_STRENGTH;
        myTank.setStrength(strength);
    }
};

const touchstart = function touchstart(e) {
    if (e.target == playground) {
        if (e.touches.length == 2) {
            let viewportOffset = playground.getBoundingClientRect();
            let mouseX = ((e.touches[0].clientX - viewportOffset.left) / playground.clientWidth) * WIDTH;
            if (mouseX <= WIDTH / 2) {
                myTank.setPosition(1, "sub");
            } else {
                myTank.setPosition(1, "add");
            }
            e.preventDefault();
        }
    }
    inputdown(e.touches[0].target, e.touches[0].clientX, e.touches[0].clientY);
};

const mousedown = function mousedown(e) {
    inputdown(e.target, e.clientX, e.clientY);
};

const inputup = function inputup() {
    playgroundDown = false;
    strengthSliderDown = false;
};

const mouseup = function mouseup() {
    inputup();
};

const touchend = function touchend() {
    inputup();
};

const keyDown = function keyDown(e) {
    switch (e.keyCode) {
        case 32:
            fireClick();
            break;
        case 37:
            myTank.setPosition(1, "sub");
            break;
        case 38:
            myTank.setStrength(2, "add");
            break;
        case 39:
            myTank.setPosition(1, "add");
            break;
        case 40:
            myTank.setStrength(2, "sub");
            break;
        case 65:
            myTank.setAngle(.1, "add");
            break;
        case 68:
            myTank.setAngle(.1, "sub");
            break;
    }
};

const weaponClick = function weaponClick() {
    if (weaponChooseVisible) {
        hideWeapons();
    } else {
        showWeapons();
    }
};

const weaponElementClick = function weaponElementClick(e) {
    setActiveWeapon(e.currentTarget.id);
    hideWeapons();
};

const fireClick = function fireClick() {
    disableGameInteraction();
    timeLine.style.background = "#00cf00";
    sendFire(myTank.getObject());
};
