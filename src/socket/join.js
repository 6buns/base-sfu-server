const { createRoom } = require("./helper/createRoom");
const Peer = require("../Peer");

const join = (io, socket) => {
    return async ({ roomId, options, name }, callback) => {
        const router1 = await createRoom(roomId, options);

        const newPeer = new Peer(roomId, { name, isAdmin: false }, socket);

        rooms[roomId]._addPeer(newPeer);

        const rtpCapabilities = router1.rtpCapabilities;

        callback({ rtpCapabilities }); 
    };
};

exports.join = join;
