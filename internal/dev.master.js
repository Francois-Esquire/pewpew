const cluster = require('cluster');
const chalk = require('chalk');

module.exports = async function master({
  clustering,
  paths,
  print,
  debug = true,
}) {
  require('redis').debug_mode = debug;

  require('./dev.webpack')(({ css, scripts, meta, hash }) => {
    const assets = { css, scripts, meta, hash };
    Object.keys(cluster.workers).forEach(id => cluster.workers[id].send('assets', assets));
  }, { paths, print });

  require('./dev.sentry')((sentry, cb) => cb((event) => {
    switch (event) {
      default: break;
      case 'change': {
        Object.keys(cluster.workers).forEach(id => cluster.workers[id].send('restart'));
        break;
      }
    }
  }), ['./dist/*.js', './server/models/*.js'], { print, options: {} });

  // const { spawn } = require('child_process');
  // const ls = spawn('npm', ['run', 'watch']);
  //
  // ls.stdin.on('data', (data) => {
  //   log(`stdin: ${data}`);
  // });
  // ls.stdout.on('data', (data) => {
  //   log(`stdout: ${data}`);
  // });
  //
  // ls.stderr.on('data', (data) => {
  //   log(`stderr: ${data}`);
  // });
  // ls.on('close', (code) => {
  //   log(`child process exited with code ${code}`);
  // });

  const sockets = [];

  function fork() {
    return cluster
      .fork()
      .on('message', (message, handle) => {
        const [type, action] = message.split('.');
        switch (type) {
          default: break;
          case 'socket': {
            switch (action) {
              default: break;
              case 'connect': {
                sockets.push(handle);
                break;
              }
            }
          }
        }
      })
      .on('exit', (worker, code) => {
        print.warn(chalk`{magenta worker ${worker.id} died, code: ${code}.}`);
        fork();
      });
  }

  cluster.on('listening', (worker, address) => {
    print.log(
      `A worker is now connected to ${address.address}:${address.port}`);
  });

  let cpuCount = clustering.use || clustering.length;

  while (cpuCount !== 0) {
    fork();
    cpuCount -= 1;
  }
};
