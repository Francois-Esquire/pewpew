const chalk = require('chalk');

class SocketManager extends Map {
  _generateId() {
    return ((this.size + Math.random()) * Math.random());
  }
  connect(socket, src) {
    if (socket) {
      // eslint-disable-next-line no-underscore-dangle
      if (socket.sid === undefined) Object.assign(socket, { sid: this._generateId() });
      const id = socket.sid;

      if (!this.has(id)) {
        this.set(id, socket);

        print.log(chalk`\t{bold.blue new ${src || '\b'} socket connection: ${id}, size: ${this.size}}`);

        return socket
          .on('end', () => this.remove(id, 'ending'))
          .on('close', () => this.remove(id, 'closing'));
      }
      return false;
    }
    return false;
  }
  remove(id, action) {
    if (this.has(id)) {
      this.delete(id);
      print.log(chalk`\t{bold.yellow ${action} socket: ${id}, size: ${this.size}}`);
      return true;
    }
    return false;
  }
  terminate(socket, id) {
    if (!socket.destroyed) {
      if (socket.destroy) socket.destroy();
      this.remove(id, 'terminating');
      return true;
    }
    return false;
  }
  purge() {
    this.forEach(this.terminate, this);
    this.clear();
    print.log(chalk`\t{bold.blue purging sockets size: ${this.size}}`);
  }
}

module.exports = new SocketManager();
