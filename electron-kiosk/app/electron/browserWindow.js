const {
  BrowserWindow,
  BrowserView,
  ipcMain,
  screen,
  protocol,
} = require("electron");
const { isUrl } = require("./utils");
const axios = require("axios");
const Jimp = require("jimp");
const path = require("path");
const Protocol = require("./protocol");
const { SELF_HOST, DEFAULT_URL } = require("./constants");
const { PNG } = require("pngjs");
const pixelMatch = require("pixelmatch");
// interface Data {
//   data: {
//     url?: string;
//     quality?: number;
//   };
//   deviceId: string;
// }

let browserView; //: Electron.BrowserView;
let browserWindow;

// // Needs to be called before app is ready;
// // gives our scheme access to load relative files,
// // as well as local storage, cookies, etc.
// // https://electronjs.org/docs/api/protocol#protocolregisterschemesasprivilegedcustomschemes
protocol.registerSchemesAsPrivileged([
  {
    scheme: Protocol.scheme,
    privileges: {
      standard: true,
      secure: true,
    },
  },
]);
const createBrowserWindow = async (isDev) => {
  if (!isDev) {
    // Needs to happen before creating/loading the browser window;
    // protocol is only used in prod
    protocol.registerBufferProtocol(
      Protocol.scheme,
      Protocol.requestHandler
    ); /* eng-disable PROTOCOL_HANDLER_JS_CHECK */
  }
  const { width, height } = screen.getPrimaryDisplay().bounds;
  // Create the browser window.
  browserWindow = new BrowserWindow({
    width,
    height,
    frame: false,
    show: false,
    fullscreen: true,
    webPreferences: {
      devTools: isDev,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
      /* eng-disable PRELOAD_JS_CHECK */
      disableBlinkFeatures: "Auxclick",
    },
  });
  console.log({ isDev });
  // Load app
  if (isDev) {
    await browserWindow.loadURL(SELF_HOST);
    browserWindow.webContents.openDevTools();
  } else {
    await browserWindow.loadURL(`${Protocol.scheme}://rse/index.html`);
  }

  browserWindow.once("ready-to-show", () => {
    browserWindow.show();
    browserWindow.maximize();
    browserView = new BrowserView();
    browserWindow.setBrowserView(browserView);
    browserView.setBackgroundColor("#000");
    browserView.setBounds({ x: 0, y: 0, width, height });
    browserView.webContents.loadURL(DEFAULT_URL);
  });

  // // const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // connect().then(() => {
  //   subscribe("screenCapture", screenCapture({ width, height }));
  // });

  browserWindow.on("closed", () => {
    browserWindow = null;
  });

  // https://electronjs.org/docs/tutorial/security#1-only-load-secure-content;
  // The below code can only run when a scheme and host are defined, I thought
  // we could use this over _all_ urls
  // ses.fromPartition(partition).webRequest.onBeforeRequest({urls:["http://localhost./*"]}, (listener) => {
  //   if (listener.url.indexOf("http://") >= 0) {
  //     listener.callback({
  //       cancel: true
  //     });
  //   }
  // });

  return browserWindow;
};

const loadURL = async ({ data: { url } }) => {
  try {
    if (isUrl(url)) {
      await browserView.webContents.loadURL(url);
    }
  } catch (e) {
    console.log("loadURL", e);
  }
};

const desktopCapture = () => {
  return new Promise((resolve, reject) => {
    try {
      const { width, height } = screen.getPrimaryDisplay().bounds;
      console.log("desktopCapture");
      browserWindow.webContents.send("takeDesktopCapture", {
        width,
        height,
      });
      ipcMain.once("desktopCapturedImage", async (event, dataURL) => {
        const image = await Jimp.read(
          Buffer.from(dataURL.split(",")[1], "base64")
        );
        image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
          resolve(buffer);
        });
      });
    } catch (error) {
      console.error({ error });
      reject(error);
    }
  });
};

const capturePage = async ({ width, height }) => {
  const capturedImage = await browserView.webContents.capturePage();
  const image = await Jimp.read(capturedImage.toPNG());
  return new Promise((resolve) => {
    image.resize(width, height).getBuffer(Jimp.MIME_PNG, (err, buffer) => {
      resolve(buffer);
    });
  });
};
const validateScreenContent = async ({
  data: { putSignedURLs, threshold },
}) => {
  try {
    const { width, height } = screen.getPrimaryDisplay().bounds;
    const images = {
      actual: await desktopCapture(),
      expected: await capturePage({ width, height }),
      difference: new PNG({ width, height }),
    };

    pixelMatch(
      PNG.sync.read(images.actual).data,
      PNG.sync.read(images.expected).data,
      images.difference.data,
      width,
      height,
      {
        threshold: threshold || 0.1,
      }
    );
    console.log({ threshold });
    images.difference = PNG.sync.write(images.difference);

    const responses = await Promise.all(
      Object.keys(images).map((key) =>
        axios.put(putSignedURLs[key], images[key], {
          headers: {
            "Content-Type": "image/png",
          },
        })
      )
    );
    responses.forEach((response) =>
      console.log(response.config.url, response.statusText)
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  createBrowserWindow,
  loadURL,
  validateScreenContent,
};
