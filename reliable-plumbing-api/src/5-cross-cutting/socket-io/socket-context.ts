
import * as io from 'socket.io';

export class SocketContext {

    // all users connected
    public static connections = {};

    // subscribers for the tracking event
    public static trackingSubscribers = [];

    // for all now online users that need to be tracked
    public static trackedUsers = {};

    public static io: SocketIO.Server;

    static addConnection(userId) {
        this.io.on('connection', (data) => {
            console.log(data);
        })
    }
}