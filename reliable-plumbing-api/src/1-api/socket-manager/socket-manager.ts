import { SocketContext } from '../../5-cross-cutting/cross-cutting.module';
import config from '../../config';

export function listenToSocketsEvents(socket) {
    socket.on('disconnect', () => disconnect(socket))

    socket.on(config.socketsSettings.registerConnection,
        (connection) => registerConnection(socket, connection));

    socket.on(config.socketsSettings.updateLocation,
        (updatedLocation) => updateTrackingMap(updatedLocation));

    socket.on(config.socketsSettings.trackingsubscription,
        (connection) => registerTrackingSubscriber(socket, connection));

    socket.on(config.socketsSettings.removeTrackingSubscription, 
        (connection) => removeTrackingSubscription(socket, connection))
}


function disconnect(socket) {
    let disconnectUser = null;
    // search for the socket by id in all existing connections, then remove it
    for (let userId of Object.getOwnPropertyNames(SocketContext.connections)) {
        let userConnections = SocketContext.connections[userId];
        let found = false;
        for (let userClient of userConnections) {
            if (userClient.socket.id == socket.id) {
                found = true;
                disconnectUser = userClient;
                disconnectUser.userId = userId;
                SocketContext.connections[userId] = userConnections.filter(conn => conn.socket.id != socket.id);
                // remove from tracked users
                disconnectUser.tracked = false;
                if (SocketContext.trackedUsers[userId] != null) {
                    let beforeFilterLength = SocketContext.trackedUsers[userId].length;
                    SocketContext.trackedUsers[userId] = SocketContext.trackedUsers[userId].filter(loc => loc.clientId != disconnectUser.clientId);
                    disconnectUser.tracked = beforeFilterLength > SocketContext.trackedUsers[userId].length;
                }
                break;
            }
        }
        if (found) break;
    }
    // remove from tracking subscribers if exists
    SocketContext.trackingSubscribers = SocketContext.trackingSubscribers.filter(soc => soc.id != socket.id);

    // if user being tracked, emit for all tracking subscribers that he is disconnected
    if (disconnectUser != null && disconnectUser.tracked)
        SocketContext.trackingSubscribers.forEach(subscriber => {
            let fsg= config.socketsSettings.trackedUserDisconnected
            subscriber.emit(config.socketsSettings.trackedUserDisconnected, {
                userId: disconnectUser.userId,
                clientId: disconnectUser.clientId
            });
        })
}

function registerConnection(socket, connection) {
    let clientId = connection.clientId,
        userId = connection.userId;

    if (SocketContext.connections[userId] == null)
        SocketContext.connections[userId] = [];

    // check if this new connection or reconnect
    let userClient = SocketContext.connections[userId].find(conn => conn.clientId == clientId);

    if (userClient == null) // if new push it the users connections
        SocketContext.connections[userId].push({ clientId: clientId, socket: socket });
    else // if reconnect replace the socket with the new socket
        userClient.socket = socket;
}

function updateTrackingMap(updatedLocation) {
    let clientId = updatedLocation.clientId,
        userId = updatedLocation.userId;

    if (SocketContext.trackedUsers[userId] == null)
        SocketContext.trackedUsers[userId] = [];

    // check if this new connection or reconnect
    let userClient = SocketContext.trackedUsers[userId].find(conn => conn.clientId == clientId);

    if (userClient == null) // if new push it the users connections
        SocketContext.trackedUsers[userId].push({
            clientId: clientId,
            lat: updatedLocation.lat,
            lng: updatedLocation.lng,
            timestamp: updatedLocation.timestamp
        });
    else {
        userClient.lat = updatedLocation.lat;
        userClient.lng = updatedLocation.lng;
        userClient.timestamp = updatedLocation.timestamp;
    }

    SocketContext.trackingSubscribers.forEach(subscriber => {
        subscriber.emit(config.socketsSettings.updateTrackingMap, updatedLocation);
    });
}

function registerTrackingSubscriber(socket, connection) {
    SocketContext.trackingSubscribers.push(socket);
}

function removeTrackingSubscription(socket, connection){
    SocketContext.trackingSubscribers = SocketContext.trackingSubscribers.filter(soc => soc.id != socket.id);
}