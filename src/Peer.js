module.exports = class Peer {
  constructor(roomId, { name, isAdmin }, socket) {
    this.socket = socket;
    this.roomId = roomId;

    this.producerTransport;
    this.consumerTransports = [];
    this.producers = [];
    this.consumers = [];

    this.details = {
      name: name || "",
      isAdmin: isAdmin || false,
    };
  }

  _addTransport = (consume, transport) => {
    if (consume) {
      this.consumerTransports.push(transport);
    } else {
      this.producerTransport = transport;
    }
  };

  _getTransport = (consume, transportId) => {
    if (consume) {
      return this.consumerTransports.find(
        (transport) => transport.id === transportId
      );
    } else {
      return this.producerTransport;
    }
  };

  _addProducer = (producer) => {
    this.producers.push(producer);
  };

  _getProducer = (producerId) => {
    return this.producers.find((producer) => producer.id === producerId);
  };

  _getAllProducers = () => {
    return this.producers.map((producer) => producer.id);
  };

  _addConsumer = (consumer) => {
    this.consumers.push(consumer);
  };

  _getPeerStat = () => {
    return new Promise(async (resolve, reject) => {
      let peerStat = {};

      peerStat['name'] = this.details.name

      await Promise.all(this.consumers.map(async (consumer) => {
        try {
          const e = await consumer.getStats();
          peerStat[consumer.id] = e
        } catch (error) {
          reject(error)
        }
      }))

      await Promise.all(this.consumerTransports.map(async (transport) => {
        try {
          const e = await transport.getStats()
          peerStat[transport.id] = e
        } catch (error) {
          reject(error)
        }
      }))

      resolve(peerStat);
    })

  }

  _destroy = () => {
    this.producers &&
      this.producers.length > 0 &&
      this.producers.splice(0, this.producers.length);
    this.transports &&
      this.transports.length > 0 &&
      this.transports.splice(0, this.transports.length);
    this.consumers &&
      this.consumers.length > 0 &&
      this.consumers.splice(0, this.consumers.length);

    this.socket = {};
    this.roomId = "";
    this.details = {};
  };
};
