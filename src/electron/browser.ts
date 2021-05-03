import { BrowserWindow } from "electron";
import { SCREEN_SIZE } from "../constants";
import { isUrl } from "./utils";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

interface url {
  url: string;
}

export const createBrowserWindow = async (): Promise<Electron.BrowserWindow> => {
  // Create the browser window.
  let browserWindow = new BrowserWindow({
    ...SCREEN_SIZE,
    frame: false,
    show: false,
  });

  browserWindow.once("ready-to-show", () => {
    browserWindow.show();
    browserWindow.maximize();
  });

  //garbage collection handle
  browserWindow.on("close", function () {
    browserWindow = null;
  });

  // and load the index.html of the app.
  await browserWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  return browserWindow;
};

export const loadURL = (browserWindow: Electron.BrowserWindow) => ({
  url,
}: url): void => {
  if (isUrl(url)) {
    browserWindow.loadURL(url);
  }
};
