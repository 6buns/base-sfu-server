const recieverResume = (io, socket) => {
    return async ({ serverConsumerId, roomId }) => {
        const room = rooms.get(roomId);
        const peer = room._getPeer(socket.id);

        await peer.consumers
            .find((consumerData) => consumerData.id === serverConsumerId)
            .resume();
    };
};
exports.recieverResume = recieverResume;
