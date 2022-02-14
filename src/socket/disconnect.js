const disconnect = (io, socket) => {
    return async () => {
        await new Promise((resolve, reject) => {
            rooms.forEach((roomId, room, rooms) => {
                try {
                    if (room._getPeer(socket.id) !== undefined) {
                        room._removePeer(socket.id);
                    }
                    if (room._countPeer() === 0) {
                        // delete rooms[room.name];
                        rooms.delete(room.name)
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    };
};

exports.disconnect = disconnect;
