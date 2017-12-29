import * as debug from 'debug';
import * as express from 'express';
import * as socketio from 'socket.io';
import * as http from 'http';
import * as path from 'path';
import { App } from './1-api/app';
import { SocketContext } from './5-cross-cutting/cross-cutting.module';
import { listenToSocketsEvents } from './1-api/socket-manager/socket-manager';
import * as dotenv from 'dotenv';
import config from './config';
import * as bodyParser from 'body-parser';

if (process.env.NODE_ENV == 'production')
  dotenv.config();
const port = normalizePort(process.env.PORT || 3000);

var app = express();

if (config.production) {
  app.use(express.static(__dirname + "/dist-client"));
  app.use(/^(\/\/.+|(?!\/api).*)$/, function (req, res, next) {
    res.sendFile(path.join(__dirname + "/dist-client/index.html"))
  });
}

if (config.filesSettings.enableGetFiles){
  app.use('/files', express.static(__dirname + "/files"));
}

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

var server = http.createServer(app);
SocketContext.io = socketio().listen(server);
App.createServer(app);

server.listen(port);

SocketContext.io.on('connection', (socket) => listenToSocketsEvents(socket));

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