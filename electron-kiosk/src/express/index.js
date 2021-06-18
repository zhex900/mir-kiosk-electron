import { connect } from "../electron/IoT";
import express from "express";
let app = express();
app.get("/", function (req, res) {
  res.send("Hello world! Lala Seth is here!");
});
let server = app.listen(3002, async function () {
  console.log("Express server listening on port " + server.address().port);

  const connection = await connect(0); // @TODO retry to connect
});
console.log("express");
