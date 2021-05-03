import { app, BrowserWindow } from "electron";
import macAddress from "macaddress";
import { connect, subscribe } from "./electron/pubSub";
import { createBrowserWindow, loadURL } from "./electron/browser";
import { MqttClientConnection } from "aws-crt/dist/native/mqtt";
import { DEFAULT_URL } from "./constants";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

let connection: MqttClientConnection;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  const deviceId = await macAddress.one();
  console.log({ deviceId });
  connection = await connect(deviceId);

  const browserWindow = await createBrowserWindow();
  const url = process.env.KIOSK_URL || DEFAULT_URL;

  await browserWindow.loadURL(url.toString());
  subscribe(deviceId, "loadURL", loadURL(browserWindow));
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async (event) => {
  event.preventDefault();
  await connection.disconnect();
  process.exit(0);
});

app.on("activate", async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    await createBrowserWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
