const getProducers = (io, socket) => {
    return ({ roomId }, callback) => {
        const room = rooms.get(roomId);

        callback(room._getProducers(socket.id));
    };
};

exports.getProducers = getProducers;
