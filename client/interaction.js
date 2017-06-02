/**
 * Created by reiem on 30.05.2017.
 */

const Interaction = class Interaction {
    constructor(gui) {
        this.gui = gui;
        this.enabled = true;
        this.playgroundDown = false;
        this.strengthSliderDown = false;

        document.addEventListener("mousedown", this.mousedown.bind(this));
        document.addEventListener("touchstart", this.touchstart.bind(this));
        document.addEventListener("mouseup", this.mouseup.bind(this));
        document.addEventListener("touchend", this.touchend.bind(this));
        document.addEventListener("mousemove", this.mousemove.bind(this));
        document.addEventListener("touchmove", this.touchmove.bind(this));
        document.body.querySelector("button[name=fire]").addEventListener("click", this.fireClick.bind(this));
        document.body.querySelector("button[name=weapon]").addEventListener("click", this.weaponClick.bind(this));
        document.body.querySelector("button[name=fire]").removeAttribute("disabled");
        document.body.querySelector("button[name=weapon]").removeAttribute("disabled");
        for (let i = 0; i < this.gui.weaponElements.length; i++) {
            this.gui.weaponElements[i].addEventListener("click", this.weaponElementClick.bind(this));
        }
        window.addEventListener("keydown", this.keyDown.bind(this));
    }

    enable() {
        this.enabled = true;
        Gui.enableButtons();
    }

    disable() {
        this.enabled = false;
        Gui.disableButtons();
    }

    inputmove(clientX, clientY, e) {
        if (this.playgroundDown) {
            let playground = this.gui.playground;
            let viewportOffset = playground.getBoundingClientRect();
            let mouseX = ((clientX - viewportOffset.left) / playground.clientWidth) * WIDTH;
            let mouseY = ((clientY - viewportOffset.top) / playground.clientHeight) * HEIGHT;
            this.gui.getGame().tankFollowMouse(mouseX, mouseY);
            if (e !== undefined) {
                e.preventDefault();
            }
        } else if (this.strengthSliderDown) {
            let strengthSlider = this.gui.strengthSlider;
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
            this.gui.getGame().tankSetStrength(strength);
            if (e !== undefined) {
                e.preventDefault();
            }
        }
    }

    touchmove(e) {
        if (this.enabled) {
            if (e.touches.length == 1) {
                this.inputmove(e.touches[0].clientX, e.touches[0].clientY, e);
            }
        }
    }

    mousemove(e) {
        if (this.enabled) {
            this.inputmove(e.clientX, e.clientY);
        }
    }

    inputdown(target, clientX) {
        let playground = this.gui.playground;
        let strengthSlider = this.gui.strengthSlider;
        let strengthbox = this.gui.strengthbox;
        if (target == playground) {
            this.playgroundDown = true;
        } else if (target == strengthSlider) {
            this.strengthSliderDown = true;
        } else if (target == strengthbox) {
            this.strengthSliderDown = true;
            let viewportOffset = strengthbox.getBoundingClientRect();
            let mouseX = clientX - viewportOffset.left;

            let strength;
            strength = (mouseX / viewportOffset.width) * MAX_STRENGTH;
            this.gui.getGame().tankSetStrength(strength);
        }
    }

    touchstart(e) {
        if (this.enabled) {
            let playground = this.gui.playground;
            if (e.target == playground) {
                if (e.touches.length == 2) {
                    let viewportOffset = playground.getBoundingClientRect();
                    let mouseX = ((e.touches[0].clientX - viewportOffset.left) / playground.clientWidth) * WIDTH;
                    if (mouseX <= WIDTH / 2) {
                        this.gui.getGame().tankSetPosition(1, "sub");
                    } else {
                        this.gui.getGame().tankSetPosition(1, "add");
                    }
                    e.preventDefault();
                }
            }
            this.inputdown(e.touches[0].target, e.touches[0].clientX, e.touches[0].clientY);
        }
    }

    mousedown(e) {
        if (this.enabled) {
            this.inputdown(e.target, e.clientX, e.clientY);
        }
    }

    inputup() {
        this.playgroundDown = false;
        this.strengthSliderDown = false;
    }

    mouseup() {
        if (this.enabled) {
            this.inputup();
        }
    }

    touchend() {
        if (this.enabled) {
            this.inputup();
        }
    }

    keyDown(e) {
        if (this.enabled) {
            switch (e.keyCode) {
                case 32:
                    this.fireClick();
                    break;
                case 37:
                    this.gui.getGame().tankSetPosition(1, "sub");
                    break;
                case 38:
                    this.gui.getGame().tankSetStrength(2, "add");
                    break;
                case 39:
                    this.gui.getGame().tankSetPosition(1, "add");
                    break;
                case 40:
                    this.gui.getGame().tankSetStrength(2, "sub");
                    break;
                case 65:
                    this.gui.getGame().tankSetAngle(.1, "add");
                    break;
                case 68:
                    this.gui.getGame().tankSetAngle(.1, "sub");
                    break;
            }
        }
    }

    weaponClick() {
        if (this.enabled) {
            if (this.gui.weaponChooseVisible) {
                this.gui.hideWeapons();
            } else {
                this.gui.showWeapons();
            }
        }
    };

    weaponElementClick(e) {
        if (this.enabled) {
            this.gui.game.tankSetWeapon(e.currentTarget.id);
            this.gui.hideWeapons();
        }
    };

    fireClick() {
        if (this.enabled) {
            this.gui.game.conclude();
        }
    };
};
