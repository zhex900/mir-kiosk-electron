const si = require('systeminformation');

// promises style - new since version 3
// si.cpu()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// si.graphics().then(data => console.log(data));
// si.usb().then(data => console.log(data));

// define all values, you want to get back
valueObject = {
  cpu: '*',
  osInfo: 'platform, release',
  system: '*', //'model, manufacturer'
  graphics: '*',
  mem: '*',
  usb: '*',
  networkInterfaces: '*'
}

si.get(valueObject).then(data => console.log(JSON.stringify(data, null, 4)));

// const ipc = require("node-ipc");

/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

// ipc.config.id = "aws-iot-sockets";
// ipc.config.retry = 1500;

// const cat = (data) => console.log("cat", data);
// const plus = (data) => console.log("plus", data);
// const dog = (data) => console.log("dog", data);
// ipc.connectTo("iot", function () {
//   ipc.of.iot.on("connect", function () {
//     ipc.log("## connected to world ##", ipc.config.delay);
//     subscribe([cat, plus, dog]);
//   });
//   ipc.of.iot.on("disconnect", function () {
//     ipc.log("disconnected from world");
//   });
// });

// const subscribe = (subscriptions) => {
//   ipc.of.iot.emit(
//     "awsIoTSubscription", //any event or message type your server listens for
//     subscriptions.map((subscription) => subscription.name)
//   );
//   subscriptions.forEach((subscription) =>
//     ipc.of.iot.on(
//       `awsIoTSubscription/${subscription.name}`, //any event or message type your server listens for
//       function (data) {
//         ipc.log("got a message from : ", subscription.name, data);
//         subscription(data);
//       }
//     )
//   );
// };