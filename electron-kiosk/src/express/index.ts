/* eslint-disable @typescript-eslint/no-var-requires */
const { connect } = require("./IoT");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");
const app = express();
console.log("express start");
app.get("/", function (req, res) {
  res.send("Hello world! Lala Seth is here!");
});
const server = app.listen(3002, async function () {
  console.log("Express server listening on port " + server.address().port);

  connect(0); // @TODO retry to connect
});
console.log("express");
