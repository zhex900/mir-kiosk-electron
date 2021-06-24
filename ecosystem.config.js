module.exports = {
  apps : [{
    node: 'router',
    script: 'windowsSockets/dist/windowsSockets/src/index.js',
    watch: '.'
  },
  {
    "name"       : "electron",
    "script"     : "electronKiosk/out/my-new-app-win32-x64/my-new-app.exe",
    "exec_interpreter": "none",
    "exec_mode"  : "fork_mode"
  }
],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
