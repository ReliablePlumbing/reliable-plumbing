
import * as io from 'socket.io';

export class SocketContext {

    public static connections = {};

    public static io: SocketIO.Server;

    static addConnection(userId){
        this.io.on('connection', (data) => {
            console.log(data);
        })
    }
}