const { createWebRtcTransport } = require("./helper/createWebRtcTransport");

const createWebRtcTransportHandler = (io, socket) => {
    return async ({ roomId }, callback) => {
        const room = rooms.get(roomId);
        const peer = room._getPeer(socket.id);

        const router = room.router;

        createWebRtcTransport(router)
            .then(
                (transport) => {
                    callback({
                        params: {
                            id: transport.id,
                            iceParameters: transport.iceParameters,
                            iceCandidates: transport.iceCandidates,
                            dtlsParameters: transport.dtlsParameters,
                        },
                    });

                    // add transport to Peer's properties
                    peer._addTransport(transport);
                },
                (error) => {
                    console.log(error);
                }
            )
            .catch(console.log);
    };
};

exports.createWebRtcTransportHandler = createWebRtcTransportHandler;
