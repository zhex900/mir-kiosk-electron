import { BrowserWindow } from "electron";
import { SCREEN_SIZE } from "../constants";
import { isUrl } from "./utils";
import axios from "axios";

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
  });

  browserWindow.once("ready-to-show", () => {
    browserWindow.show();
    browserWindow.maximize();
  });

  //garbage collection handle
  browserWindow.on("close", function () {
    browserWindow = null;
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
