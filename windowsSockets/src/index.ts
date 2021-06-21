import ipc from "node-ipc";

import { connect, disconnect, subscribe } from "../../awsIoT/src";

// do cert provisioning

// make the aws iot connection
connect(0); // @TODO emit logs to client
// re-run after reconnect
ipc.config.id = "iot"; // @TODO move to constants
ipc.config.retry = 1500;

ipc.serve(function () {
  ipc.server.on("awsIoTSubscription", function (subscriptions, socket) {
    subscriptions.forEach((subscription) => {
      subscribe(subscription, (data) => {
        ipc.server.emit(socket, `awsIoTSubscription/${subscription}`, data);
      });
    });
  });

  ipc.server.on("socket.disconnected", function (socket, destroyedSocketID) {
    ipc.log("client " + destroyedSocketID + " has disconnected!");
  });
});

ipc.server.start();

//@TODO use most secure https://github.com/RIAEvangelist/node-ipc/tree/master/example/TLSSocket
