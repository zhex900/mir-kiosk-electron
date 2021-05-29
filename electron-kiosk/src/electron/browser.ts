import { BrowserWindow } from "electron";
import { SCREEN_SIZE } from "../constants";
import { isUrl } from "./utils";
import axios from "axios";
const path = require("path");

interface Data {
  data: {
    url?: string;
    quality?: number;
  };
  deviceId: string;
}

export const createBrowserWindow = async (): Promise<Electron.BrowserWindow> => {
  // Create the browser window.
  let browserWindow = new BrowserWindow({
    ...SCREEN_SIZE,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  console.log(path.join(__dirname, "preload.js"));
  browserWindow.loadFile(path.join(__dirname, "index.html"));
  browserWindow.webContents.openDevTools();
  browserWindow.once("ready-to-show", () => {
    browserWindow.show();
    browserWindow.maximize();
  });

  //garbage collection handle
  browserWindow.on("close", function () {
    browserWindow = null;
  });
  const content = browserWindow.webContents;
  content.on("did-finish-load", () => {
    content.insertCSS(`
    /* disable selection */s    
:not(input):not(textarea),
:not(input):not(textarea)::after,
:not(input):not(textarea)::before {
    -webkit-user-select: none;
    user-select: none;
    cursor: default;
}
input, button, textarea, :focus {
    outline: none;
}

* {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
 }
 
/* disable image and anchor dragging */
a:not([draggable=true]), img:not([draggable=true]) {
    -webkit-user-drag: none;
    user-drag: none;
}
a[href^="http://"],
a[href^="https://"],
a[href^="ftp://"] {
    -webkit-user-drag: auto;
    user-drag: auto;
}
    `);
  });
  return browserWindow;
};

export const loadURL = (browserWindow: Electron.BrowserWindow) => async ({
  data: { url },
}: Data): Promise<void> => {
  try {
    if (isUrl(url)) {
      await browserWindow.loadURL(url);
    }
  } catch (e) {
    console.log("loadURL", e);
  }
};

export const screenCapture = (browserWindow: Electron.BrowserWindow) => async (
  data: Data
): Promise<void> => {
  try {
    console.log({ data });
    const image = await browserWindow.webContents.capturePage();
    const quality = data.data.quality || 50;

    const response = await axios.put(data.data.url, image.toJPEG(quality), {
      headers: {
        "Content-Type": "image/png",
      },
    });

    console.log({ response });
  } catch (error) {
    console.error({ error });
  }
};
