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
        // create a room.
        router = await worker.createRouter({ mediaCodecs: codecs });
        rooms[room] = new Room(room, router);
        // check in redis,
        if (isInRedis) {
            // create a pipe,
            // store its reference in redis as multiplier.
        } else {
            // store it in redis as original.
        }
    }

    return router
};

exports.createRoom = createRoom;
