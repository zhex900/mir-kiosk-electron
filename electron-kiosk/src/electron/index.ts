import {
  createBrowserWindow,
  loadURL,
  validateScreenContent,
} from "./browserWindow";

import { connect, disconnect, subscribe } from "./IoT";

import { app, BrowserWindow } from "electron";

const isDev = process.env.NODE_ENV === "development";

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  try {
    const connection = await connect(0); // @TODO retry to connect
    await createBrowserWindow(isDev);
    if (connection) {
      await subscribe(loadURL);
      await subscribe(validateScreenContent);
    } else {
      app.quit();
      // no internet connection
      process.exit(0);
    }
  } catch (e) {
    console.log("ready error", { e });
  }
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async (event) => {
  event.preventDefault();
  // await disconnect();
  // process.exit(0);
});

app.on("activate", async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    await createBrowserWindow(isDev);
  }
});

// https://electronjs.org/docs/tutorial/security#12-disable-or-limit-navigation
app.on("web-contents-created", (event, contents) => {
  // contents.on("will-navigate", (contentsEvent, navigationUrl) => {
  /* eng-disable LIMIT_NAVIGATION_JS_CHECK  */
  // const parsedUrl = new URL(navigationUrl);
  // const validOrigins = [selfHost];
  // Log and prevent the app from navigating to a new page if that page's origin is not whitelisted
  // if (!validOrigins.includes(parsedUrl.origin)) {
  //   console.error(
  //     `The application tried to redirect to the following address: '${parsedUrl}'. This origin is not whitelisted and the attempt to navigate was blocked.`
  //   );
  //
  //   contentsEvent.preventDefault();
  // }
  // });

  // https://electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
  contents.on(
    "will-attach-webview",
    (contentsEvent, webPreferences, params) => {
      // Strip away preload scripts if unused or verify their location is legitimate
      delete webPreferences.preload;
      // delete webPreferences.preloadURL;

      // Disable Node.js integration
      webPreferences.nodeIntegration = false;
    }
  );

  // https://electronjs.org/docs/tutorial/security#13-disable-or-limit-creation-of-new-windows
  // This code replaces the old "new-window" event handling;
  // https://github.com/electron/electron/pull/24517#issue-447670981
  contents.setWindowOpenHandler(({ url }) => {
    const parsedUrl = new URL(url);
    const validOrigins = [];

    // Log and prevent opening up a new window
    if (!validOrigins.includes(parsedUrl.origin)) {
      console.error(
        `The application tried to open a new window at the following address: '${url}'. This attempt was blocked.`
      );
      return {
        action: "deny",
      };
    }

    return {
      action: "allow",
    };
  });
});

// Filter loading any module via remote;
// you shouldn't be using remote at all, though
// https://electronjs.org/docs/tutorial/security#16-filter-the-remote-module
app.on("remote-require", (event, webContents, moduleName) => {
  event.preventDefault();
});

// built-ins are modules such as "app"
app.on("remote-get-builtin", (event, webContents, moduleName) => {
  event.preventDefault();
});

app.on("remote-get-global", (event, webContents, globalName) => {
  event.preventDefault();
});

app.on("remote-get-current-window", (event, webContents) => {
  event.preventDefault();
});

app.on("remote-get-current-web-contents", (event, webContents) => {
  event.preventDefault();
});
