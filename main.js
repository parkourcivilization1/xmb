const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const configPath = path.join(__dirname, 'config.json');

let config = {
  hue: 0,
  apps: {}
};

function loadConfig() {
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(raw);
  }
}

function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  loadConfig();
  createWindow();
});

// Handle hue read/write
ipcMain.handle('get-config', () => config);

ipcMain.on('set-hue', (event, newHue) => {
  config.hue = newHue;
  saveConfig();
});

// Handle app launches
ipcMain.on('launch-app', (event, app) => {
  const fullPath = path.join(__dirname, app.file);
  console.log(`Launching ${app.name}: ${fullPath}`);

  switch (app.type) {
    case 'ahk':
    case 'exe':
      exec(`"${fullPath}"`, (err) => {
        if (err) console.error(`Failed to launch ${app.name}:`, err);
      });
      break;
    case 'url':
      require('electron').shell.openExternal(app.file);
      break;
    default:
      console.error('Unknown app type:', app.type);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
