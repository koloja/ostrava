import {app, BrowserWindow, ipcMain} from 'electron';
// import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

// Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST
let win: BrowserWindow | null

function createWindow() {

    // configuration
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            nodeIntegration: true
        }
    });
    if (win === null) throw new Error('win.null');

    // icp
    ipcMain.on('minimize', () => win!.minimize());
    ipcMain.on('maximize', () => (win!.isMaximized() ? win!.unmaximize() : win!.maximize()));
    ipcMain.on('close', () => win!.close());

    win.webContents.on('did-finish-load', () => {win?.webContents.send('main-process-message', (new Date).toLocaleString())});
    if (VITE_DEV_SERVER_URL) win.loadURL(VITE_DEV_SERVER_URL);
    else win.loadFile(path.join(RENDERER_DIST, 'index.html'));
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        win = null;
    }
});

app.on('activate', () => {if (BrowserWindow.getAllWindows().length === 0) createWindow()});
app.whenReady().then(createWindow);