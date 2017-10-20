import * as debug from 'debug';
import * as express from 'express';
import * as socketio from 'socket.io';
import * as http from 'http';
import { App } from './App';
import { SocketContext, ConfigService } from '../5-cross-cutting/cross-cutting.module';

debug('ts-express:server');

const port = normalizePort(process.env.PORT || 3000);

var app = express();
var server = http.createServer(app);
SocketContext.io = socketio().listen(server);
App.createServer(app);

server.listen(port);

SocketContext.io.on('connection', (socket) => {
  socket.on(ConfigService.config.socketsSettings.registerConnection, (userId) => {
    let aa = SocketContext.connections;
    SocketContext.connections[userId] = socket;
  });
});

server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val: number | string): number | string | boolean {
  let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
  if (isNaN(port)) return val;
  else if (port >= 0) return port;
  else return false;
}

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') throw error;
  let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening(): void {
  let addr = server.address();
  let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}