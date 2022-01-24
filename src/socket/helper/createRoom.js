const { mediaCodecs } = require("../../../config/mediasoup");
const { createIndexInRedis, findRoomInRedis, createRoomInRedis } = require("../../lib/redis");
const Room = require("../../Room");

const createRoom = async (room, options) => {
    let router,
        peers = [],
        codecs = mediaCodecs[options?.type || 'video'];

    if (rooms[room]) {
        router = rooms[room].router;
        peers = rooms[room].peers || [];
    } else {
        // check in redis,
        const isInRedis = await findRoomInRedis(room)
        if (isInRedis) {
            // create a room.
            router = await worker.createRouter({ mediaCodecs: codecs });
            // create a pipe,
            const pipeTransport = await router.createPipeTransport({
                listenIp: [{ ip: isInRedis.ip, announcedIp: isInRedis.announcedIp }]
            });

            // connect pipe transport
            pipeTransport.connect({
                ip: isInRedis.announcedIp
            })

            // store.
            rooms[room] = new Room(room, router);
        } else {
            // create a room.
            router = await worker.createRouter({ mediaCodecs: codecs });
            // store it in redis as original.
            await createRoomInRedis(room)
            // store.
            rooms[room] = new Room(room, router);
        }
    }

    return router
};

exports.createRoom = createRoom;
