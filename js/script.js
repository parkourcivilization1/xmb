const { ipcRenderer } = require('electron');

const video = document.getElementById("vid");
const titles = document.getElementById("title");
const warning = document.querySelectorAll(".warning")[0];
const menu = document.getElementById("menu");
const clockSection = document.querySelectorAll(".clock")[0];
const dateTime = document.getElementById("date");
const xmbMain = document.querySelectorAll(".xmb-main")[0];
const section = document.querySelectorAll(".xmb-title");
const submenuOne = document.querySelectorAll(".submenu.one");
const submenuTwo = document.querySelectorAll(".submenu.two");
const submenuthree = document.querySelectorAll(".submenu.three");
const submenu = [submenuOne, submenuTwo, submenuthree];
const startupSound = document.getElementById("startup");
const navSound = document.getElementById("nav");

let sectionNumber = 0;
let subsection = 0;
let multiSection;
let currentHue = 0;

const appLauncher = {
    apps: {
        '4:0': { file: 'desktop/YouTube.ahk', type: 'ahk', name: 'YouTube' },
        '5:0': { file: 'Games/Uncharted.exe', type: 'exe', name: 'Uncharted' },
        '3:1': { file: 'https://music.apple.com', type: 'url', name: 'Apple Music' }
    },
    launch: function (app) {
        ipcRenderer.send('launch-app', app);
        this.showFeedback(`Launching ${app.name}...`);
    },
    showFeedback: function (message) {
        const div = document.createElement('div');
        div.textContent = message;
        div.style.position = 'fixed';
        div.style.bottom = '20px';
        div.style.left = '50%';
        div.style.transform = 'translateX(-50%)';
        div.style.backgroundColor = 'rgba(0,0,0,0.7)';
        div.style.color = 'white';
        div.style.padding = '10px 20px';
        div.style.borderRadius = '5px';
        div.style.zIndex = '1000';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 2000);
    }
};

function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 86400000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [k, v] = cookie.trim().split('=');
        if (k === name) return v;
    }
    return null;
}

function applySavedHue() {
    const savedHue = parseInt(getCookie("hue")) || 0;
    currentHue = savedHue;
    video.style.filter = `hue-rotate(${currentHue}deg)`;
}

function cycleHue() {
    currentHue = (currentHue + 45) % 360;
    video.style.filter = `hue-rotate(${currentHue}deg)`;
    setCookie("hue", currentHue);
}

let checkLoad = () => {
    return new Promise((resolve) => {
        window.onload = resolve;
    });
};

let titlesTimeOut = () => {
    return new Promise(resolve => {
        setTimeout(resolve, 10000);
    });
};

let warningTimeOut = () => {
    return new Promise(resolve => {
        setTimeout(resolve, 7000);
    });
};

let warningDisplay = async () => {
    await titlesTimeOut();
    titles.remove();
    warning.style.opacity = '1';
    setTimeout(() => {
        warning.style.opacity = '0';
        warning.remove();
    }, 6000);
    await warningTimeOut();
};

let sideClock = () => {
    let d = new Date();
    let clock = `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    dateTime.innerText = clock;
    setTimeout(sideClock, 1000);
};

let loadTitles = async () => {
    await checkLoad();
    video.play();
    video.style.opacity = '1';
    titles.style.opacity = '1';
    await warningDisplay();
};

let loadMenu = async () => {
    await loadTitles();
    menu.style.opacity = '1';
    clockSection.style.opacity = '1';
    sideClock();
    setTimeout(() => applySavedHue(), 100);
};

let moveMenu = (hd, ultraHd, fullHd) => {
    let width = document.body.clientWidth;
    if (width < 1400) {
        xmbMain.style.marginRight = hd;
    }
    else if (width >= 2560 && width <= 3840) {
        xmbMain.style.marginRight = ultraHd;
    }
    else {
        xmbMain.style.marginRight = fullHd;
    }
};

let focusSection = (sn, right, left) => {
    section[sn].classList.add("active");
    if (right === true) {
        section[sn - 1].classList.remove("active");
    }
    else if (left === true) {
        section[sn + 1].classList.remove("active");
    }
    switchSection();
};

let switchSection = () => {
    multiSection = false;
    switch (sectionNumber) {
        case 0:
            moveMenu('-40%', 0, 0);
            break;
        case 1:
            moveMenu('-10%', '18%', '18%');
            multiSection = true;
            break;
        case 2:
            moveMenu('22%', '32%', '39%');
            break;
        case 3:
            moveMenu('50%', '47%', '60%');
            break;
        case 4:
            moveMenu('76%', '62%', '77%');
            break;
        case 5:
            moveMenu('100%', '77%', '97%');
            break;
    }
};

let focusSubMenu = (sn, sub, down, up) => {
    submenu.forEach(group => {
        if (group[sn]) group[sn].classList.remove("active");
    });

    switch (sub) {
        case 0:
            if (up && submenu[sub + 1][sn]) {
                submenu[sub + 1][sn].classList.remove("active");
                submenu[sub][sn].classList.remove("inactive");
            }
            break;
        case 1:
            if (down && submenu[sub][sn]) {
                submenu[sub - 1][sn].classList.add("inactive");
                submenu[sub][sn].classList.add("active");
            } else if (up && multiSection) {
                submenu[sub + 1][sn - 1]?.classList.remove("active");
                submenu[sub - 1][sn]?.classList.remove("gotop");
                submenu[sub][sn]?.classList.add("active");
            }
            break;
        case 2:
            if (down && multiSection) {
                submenu[sub - 2][sn]?.classList.add("gotop");
                submenu[sub - 1][sn]?.classList.remove("active");
                submenu[sub][sn - 1]?.classList.add("active");
            }
            break;
    }

    if (submenu[sub] && submenu[sub][sn]) {
        submenu[sub][sn].classList.add("active");
    }
};

document.body.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        navSound.play();
        e.preventDefault();
        subsection = Math.min(2, subsection + 1);
        focusSubMenu(sectionNumber, subsection, true, false);
    }
    else if (e.key === 'ArrowUp') {
        navSound.play();
        e.preventDefault();
        subsection = Math.max(0, subsection - 1);
        focusSubMenu(sectionNumber, subsection, false, true);
    }
    else if (e.key === 'ArrowRight') {
        navSound.play();
        e.preventDefault();
        sectionNumber = Math.min(5, sectionNumber + 1);
        focusSection(sectionNumber, true, false);
    }
    else if (e.key === 'ArrowLeft') {
        navSound.play();
        e.preventDefault();
        sectionNumber = Math.max(0, sectionNumber - 1);
        focusSection(sectionNumber, false, true);
    }
    else if (e.key === 'Enter') {
        const appKey = `${sectionNumber}:${subsection}`;
        const app = appLauncher.apps[appKey];

        if (app) {
            appLauncher.launch(app);
        }

        // Hue control (Settings > Display > Screensaver)
        if (sectionNumber === 1 && subsection === 2) {
            cycleHue();
        }
    }
});

// Gamepad support
let gamepadIndex = null;
let lastGamepadState = {};

window.addEventListener("gamepadconnected", (e) => {
    gamepadIndex = e.gamepad.index;
    requestAnimationFrame(updateGamepad);
});

function updateGamepad() {
    const gp = navigator.getGamepads()[gamepadIndex];
    if (!gp) return requestAnimationFrame(updateGamepad);

    const threshold = 0.5;
    const [x, y] = gp.axes;

    const state = {
        up: y < -threshold || gp.buttons[12].pressed,
        down: y > threshold || gp.buttons[13].pressed,
        left: x < -threshold || gp.buttons[14].pressed,
        right: x > threshold || gp.buttons[15].pressed,
        a: gp.buttons[0].pressed,
        b: gp.buttons[1].pressed
    };

    for (const key in state) {
        if (state[key] && !lastGamepadState[key]) {
            simulateKey(
                key === 'up' ? 'ArrowUp' :
                key === 'down' ? 'ArrowDown' :
                key === 'left' ? 'ArrowLeft' :
                key === 'right' ? 'ArrowRight' :
                key === 'a' ? 'Enter' :
                null
            );
            if (key === 'b') {
                sectionNumber = 0;
                subsection = 0;
                focusSection(sectionNumber, false, false);
            }
        }
    }

    lastGamepadState = state;
    requestAnimationFrame(updateGamepad);
}

function simulateKey(key) {
    if (!key) return;
    const event = new KeyboardEvent("keydown", { key });
    document.body.dispatchEvent(event);
}

startupSound.play();
loadMenu();
