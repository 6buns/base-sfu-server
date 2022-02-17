const { join } = require("./join");
const { disconnect } = require("./disconnect");
const { createWebRtcTransportHandler } = require("./createWebRtcTransportHandler");
const {
    senderConnect,
    senderProduce,
    recieverConnect,
    recieverConsume,
    senderClose,
} = require("./transport");
const { getProducers } = require("./getProducers");
const { recieverResume } = require("./recieverResume");

/**
 * join -> connect
 *
 * createWebRtcTransport
 * getProducers
 * transport:recieve-connect
 * consume
 * consumer-resume
 *
 * transport:connect
 * transport:produce
 *
 * leave -> disconnect
 */

module.exports = (io) => {
    io.on("connection", (socket) => {
        socket.emit("connection-success", {
            socketId: socket.id,
        });

        socket.on("disconnect", disconnect(io, socket));

        socket.on("join", join(io, socket));

        socket.on(
            "createWebRtcTransport",
            createWebRtcTransportHandler(io, socket)
        );

        socket.on("getProducers", getProducers(io, socket));
        socket.on("transport:consumer-connect", recieverConnect(io, socket));
        socket.on("transport:consumer-consume", recieverConsume(io, socket));
        socket.on("consumer-resume", recieverResume(io, socket));

        socket.on("transport:producer-connect", senderConnect(io, socket));
        socket.on("transport:producer-produce", senderProduce(io, socket));
    });
};
