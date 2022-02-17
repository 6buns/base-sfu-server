const senderConnect = (io, socket) => {
  return async ({ dtlsParameters, transportId, roomId }, callback) => {
    const room = rooms.get(roomId);
    const peer = room._getPeer(socket.id);

    try {
      const transport = await peer._getTransport(transportId);
      transport.connect({ dtlsParameters });
      console.log(dtlsParameters)
      callback({ status: "Producer Transport Connected" });
      // /**
      //  * MAX Limit : 720p video
      //  */
      // transport.setMaxIncomingBitrate(6000000);
      // transport.setMaxOutgoingBitrate(6000000);
    } catch (error) {
      callback({ status: error });
      console.log(error);
    }
  };
};

const senderProduce = (io, socket) => {
  return async ({ kind, transportId, rtpParameters, roomId }, callback) => {
    const room = rooms.get(roomId);
    const peer = room._getPeer(socket.id);
    let producer;
    // call produce based on the prameters from the client
    try {
      producer = await peer._getTransport(transportId).produce({
        kind,
        rtpParameters,
      });

    } catch (error) {
      console.log(error);
    }

    peer._addProducer(producer);
    room.hasProducers = true;

    room._informPeers(
      socket.id,
      "new-producer",
      {
        producerId: producer.id,
      },
      socket
    );

    try {
      producer.on("transportclose", () => {
        console.log("transport for this producer closed ");
        producer.close();
      });
    } catch (error) {
      console.log(error);
    }

    // Send back to the client the Producer's id
    callback({
      id: producer.id,
      /**
       * @todo : prevent calculating producers each time.
       */
      producersExist: room.hasProducers,
    });
  };
};

const recieverConnect = (io, socket) => {
  return async ({ dtlsParameters, serverConsumerTransportId, roomId }) => {
    const room = rooms.get(roomId);
    const peer = room._getPeer(socket.id);

    try {
      await peer
        ._getTransport(serverConsumerTransportId)
        .connect({ dtlsParameters });
    } catch (error) {
      console.log(error);
    }
  };
};

const recieverConsume = (io, socket) => {
  return async (
    { rtpCapabilities, remoteProducerId, serverConsumerTransportId, roomId },
    callback
  ) => {
    try {
      const room = rooms.get(roomId);
      const peer = room._getPeer(socket.id);
      const router = room.router;
      const consumerTransport = peer._getTransport(serverConsumerTransportId);

      // check if the router can consume the specified producer
      if (
        router.canConsume({
          producerId: remoteProducerId,
          rtpCapabilities,
        })
      ) {
        let consumer;
        try {
          consumer = await consumerTransport.consume({
            producerId: remoteProducerId,
            rtpCapabilities,
            paused: true,
          });
        } catch (error) {
          console.log(error);
        }

        consumer.on("transportclose", () => {
          console.log("transport close from consumer");
        });

        consumer.on("producerclose", () => {
          console.log("producer of consumer closed");

          socket.emit("producer-closed", { remoteProducerId });

          consumerTransport.close([]);

          // transports = transports.filter(
          //   (transportData) =>
          //     transportData.transport.id !== consumerTransport.id
          // );
          peer.consumerTransports = peer.consumerTransports.filter(
            (transport) => transport.id !== consumerTransport.id
          );

          room.consumerCount -= 1;

          consumer.close();

          // consumers = peer.consumers.filter(
          //   (consumerData) => consumerData.id !== consumer.id
          // );

          peer.consumers = peer.consumers.filter((c) => c.id !== consumer.id);
        });

        // addConsumer(consumer, roomName, socket);
        peer._addConsumer(consumer);
        room.consumerCount += 1;

        // from the consumer extract the following params
        // to send back to the Client
        const params = {
          id: consumer.id,
          producerId: remoteProducerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          serverConsumerId: consumer.id,
        };

        // send the parameters to the client
        callback({ params });
      }
    } catch (error) {
      console.log(error.message);
      callback({
        params: {
          error: error,
        },
      });
    }
  };
};

exports.senderConnect = senderConnect;
exports.senderProduce = senderProduce;
// exports.senderClose = senderClose;

exports.recieverConnect = recieverConnect;
exports.recieverConsume = recieverConsume;
