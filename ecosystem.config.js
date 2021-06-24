module.exports = {
  apps: [
    {
      node: "aws-iot-server",
      script: "yarn dev:aws-iot-server",
      watch: ".",
      source_map_support: true,
    },
    // {
    //   name: "kiosk",
    //   script: "yarn dev:kiosk",
    //   exec_interpreter: "none",
    //   exec_mode: "fork_mode",
    //   watch: ".",
    // },
  ],
};
