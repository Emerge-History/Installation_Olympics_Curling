const { app, BrowserWindow } = require("electron");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    alwaysOnTop: true,
    frame: false,
    fullscreen: true
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  let webContents = mainWindow.webContents;

  webContents.on("did-fail-load", () => {
    console.log("ERR_CONNECTION_REFUSED");
    setTimeout(() => {
      webContents.reload();
    }, 1000);
  });

  webContents.on("did-finish-load", () => {
    webContents.setZoomFactor(1);
    webContents.setVisualZoomLevelLimits(1, 1);
    webContents.setLayoutZoomLevelLimits(0, 0);
  });

  mainWindow.loadURL("http://192.168.1.209:8888/game.html");

  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  if (mainWindow === null) {
    createWindow();
  }
});
