const { mediaCodecs } = require("../../../config/mediasoup");
const Room = require("../../Room");

const createRoom = async (room, options) => {
    let router,
        peers = [],
        codecs = mediaCodecs[options?.type || 'video'];

    if (rooms[room]) {
        router = rooms[room].router;
        peers = rooms[room].peers || [];
    } else {
        router = await worker.createRouter({ mediaCodecs: codecs });
        rooms[room] = new Room(room, router);
    }

    return router;
};

exports.createRoom = createRoom;
