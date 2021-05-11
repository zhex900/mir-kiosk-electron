if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

import { app, BrowserWindow } from "electron";
import { connect, connectWithRetry, subscribe } from "./electron/pubSub";
import {
  createBrowserWindow,
  loadURL,
  screenCapture,
} from "./electron/browser";
import { MqttClientConnection } from "aws-crt/dist/native/mqtt";
import { DEFAULT_URL } from "./constants";

let connection: MqttClientConnection;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  try {
    const browserWindow = await createBrowserWindow();
    connection = await connectWithRetry(0); // @TODO retry to connect
    if (connection) {
      //@TODO move to constants
      await subscribe("loadURL", loadURL(browserWindow));
      await subscribe("screenCapture", screenCapture(browserWindow));
      console.log("loading window");
      const url = process.env.KIOSK_URL || DEFAULT_URL;
      await browserWindow.loadURL(url);
    } else {
      app.quit();
      // no internet connection
      process.exit(0);
    }
  } catch (e) {
    console.log("ready error", { e });
  }
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
  if (connection) {
    await connection.disconnect();
  }
  process.exit(0);
});

app.on("activate", async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    await createBrowserWindow();
  }
});
