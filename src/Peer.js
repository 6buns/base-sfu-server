module.exports = class Peer {
  constructor(roomId, { name, isAdmin }, socket) {
    this.socket = socket;
    this.roomId = roomId;

    this.transports = new Map();
    this.producers = new Map();
    this.consumers = new Map();

    this.details = {
      name: name || "",
      isAdmin: isAdmin || false,
    };
  }

  _addTransport = (transport) => {
    this.transports.set(transport.id, transport)
  };

  _getTransport = (transportId) => {
    return this.transports.get(transportId)
  };

  _addProducer = (producer) => {
    this.producers.set(producer.id, producer);
  };

  _getProducer = (producerId) => {
    return this.producers.get(producerId);
  };

  _getAllProducers = () => {
    let producersIdList = []
    for (const [id, producer] of this.producers) {
      producersIdList.push(id);
    }
    return producersIdList;
  };

  _addConsumer = (consumer) => {
    this.consumers.set(consumer.id, consumer);
  };

  _getPeerStat = () => {
    return new Promise(async (resolve, reject) => {
      let peerStat = {};

      peerStat['name'] = this.details.name
      peerStat['producers'] = []
      peerStat['consumers'] = []
      peerStat['transports'] = []

      for (const [id, producer] of this.producers) {
        try {
          const e = await producer.getStats();
          peerStat['producers'] = [...e, ...peerStat['producers']]
        } catch (error) {
          console.log(error)
          reject(error)
        }
      }

      for (const [id, consumer] of this.consumers) {
        try {
          const e = await consumer.getStats();
          peerStat['consumers'] = [...e, ...peerStat['consumers']]
        } catch (error) {
          reject(error)
        }
      }

      for (const [id, transport] of this.transports) {
        try {
          const e = await transport.getStats()
          peerStat['transports'] = [...e, ...peerStat['transports']]
        } catch (error) {
          reject(error)
        }
      }

      resolve(peerStat);
    })

  }

  _destroy = () => {
    this.producers &&
      this.producers.length > 0 &&
      this.producers.splice(0, this.producers.length);
    this.producerTransports &&
      this.producerTransports.length > 0 &&
      this.producerTransports.splice(0, this.producerTransports.length);
    this.consumerTransports &&
      this.consumerTransports.length > 0 &&
      this.consumerTransports.splice(0, this.consumerTransports.length);
    this.consumers &&
      this.consumers.length > 0 &&
      this.consumers.splice(0, this.consumers.length);

    this.socket = {};
    this.roomId = "";
    this.details = {};
  };
};
