const { createRoom } = require("./helper/createRoom");
const Peer = require("../Peer");

const join = (io, socket) => {
    return async ({ roomId, options, name }, callback) => {
        if (localConsumerCount < 100) {
            const router1 = await createRoom(roomId, options);

            const newPeer = new Peer(roomId, { name, isAdmin: false }, socket);

            rooms.get(roomId)._addPeer(newPeer);

            const rtpCapabilities = router1.rtpCapabilities;

            callback({ rtpCapabilities });
        } else {
            callback(new Error('Consumers Count above 100.'))
        }
    };
};

exports.join = join;
