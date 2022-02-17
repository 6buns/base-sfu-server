const { mediaCodecs } = require("../../../config/mediasoup");
// const {
//     createIndexInRedis,
//     findRoomInRedis,
//     createRoomInRedis,
// } = require("../../lib/redis");
const Room = require("../../Room");

const createRoom = async (roomId, options) => {
    let router,
        peers = new Map(),
        codecs = mediaCodecs[options?.type || "video"];
    let room = rooms.get(roomId);

    if (rooms.has(roomId)) {
        router = room.router;
        peers = room.peers || new Map();
    } else {
        // check in redis,
        // const isInRedis = await findRoomInRedis(room)
        router = await worker.createRouter({ mediaCodecs: codecs });
        // if (isInRedis) {
        //     // create a pipe,
        //     const pipeTransport = await router.createPipeTransport({
        //         listenIp: [{ ip: isInRedis.ip, announcedIp: isInRedis.announcedIp }]
        //     });

        //     // connect pipe transport
        //     pipeTransport.connect({
        //         ip: isInRedis.announcedIp
        //     })

        //     // store.
        //     room = new Room(room, router);
        // } else {
        // store it in redis as original.
        // await createRoomInRedis(room)
        room = new Room(roomId, router)
        // store.
        rooms.set(roomId, room)
        // }
    }
    return router;
};

exports.createRoom = createRoom;
