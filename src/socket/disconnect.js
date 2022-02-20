const disconnect = (io, socket) => {
    return async () => {
        await new Promise((resolve, reject) => {
            rooms.forEach((room, roomId, rooms) => {
                try {
                    if (room._hasPeer(socket.id)) {
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
