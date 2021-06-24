import ipc from "node-ipc";

ipc.config.id = "aws-iot-sockets";
ipc.config.retry = 1500;

const subscribe = (subscriptions) => {
  console.log("sub", Object.keys(subscriptions));
  ipc.of.iot.emit(
    "awsIoTSubscription", //any event or message type your server listens for
    Object.keys(subscriptions)
  );
  Object.keys(subscriptions).forEach((subscription) =>
    ipc.of.iot.on(
      `awsIoTSubscription/${subscription}`, //any event or message type your server listens for
      function (data) {
        ipc.log("got a message from : ", subscription, data);
        subscriptions[subscription](data);
      }
    )
  );
};

export const setSubscriptions = (subscriptions) => {
  ipc.connectTo("iot", function () {
    ipc.of.iot.on("connect", function () {
      ipc.log("## connected to iot ##", ipc.config.delay);
      subscribe(subscriptions);
    });
    ipc.of.iot.on("disconnect", function () {
      ipc.log("disconnected from iot");
    });
  });
};
