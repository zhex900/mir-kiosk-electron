const { contextBridge, desktopCapturer, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  ipcOn: (channel, callback) => ipcRenderer.on(channel, callback),
  ipcSend: (channel, args) => ipcRenderer.send(channel, args),
  desktopCapturer,
});
