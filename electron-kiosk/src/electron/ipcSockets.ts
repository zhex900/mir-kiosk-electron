import ipc from "node-ipc";
/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

ipc.config.id = "aws-iot-sockets";
ipc.config.retry = 1500;

const subscribe = (subscriptions) => {
  ipc.of.iot.emit(
    "awsIoTSubscription", //any event or message type your server listens for
    subscriptions.map((subscription) => subscription.name)
  );
  subscriptions.forEach((subscription) =>
    ipc.of.iot.on(
      `awsIoTSubscription/${subscription.name}`, //any event or message type your server listens for
      function (data) {
        ipc.log("got a message from : ", subscription.name, data);
        subscription(data);
      }
    )
  );
};

export const setSubscriptions = (subscriptions) => {
  ipc.connectTo("iot", function () {
    ipc.of.iot.on("connect", function () {
      ipc.log("## connected to world ##", ipc.config.delay);
      subscribe(subscriptions);
    });
    ipc.of.iot.on("disconnect", function () {
      ipc.log("disconnected from world");
    });
  });
};
