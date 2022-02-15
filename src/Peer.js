module.exports = class Peer {
  constructor(roomId, { name, isAdmin }, socket) {
    this.socket = socket;
    this.roomId = roomId;

    this.producerTransports = [];
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
      this.producerTransports[0] = (transport);
    }
  };

  _getTransport = (consume, transportId) => {
    if (consume) {
      return this.consumerTransports.find(
        (transport) => transport.id === transportId
      );
    } else {
      return this.producerTransports[0];
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
<<<<<<< HEAD
      peerStat['producers'] = []
      peerStat['producerTransports'] = []
      peerStat['consumers'] = []
      peerStat['consumerTransports'] = []

      await Promise.all(this.producers.map(async (producer) => {
        try {
          const e = await producer.getStats();
          peerStat['producers'] = [...e, ...peerStat['producers']]
        } catch (error) {
          console.log(error)
          reject(error)
        }
      }))
=======
>>>>>>> 7a514cf696c5ec26fe974e2af6b2e103fb0e2853

      await Promise.all(this.consumers.map(async (consumer) => {
        try {
          const e = await consumer.getStats();
<<<<<<< HEAD
          peerStat['consumers'] = [...e, ...peerStat['consumers'] ]
        } catch (error) {
          reject(error)
        }
      }))

      await Promise.all(this.producerTransports.map(async (transport) => {
        try {
          const e = await transport.getStats()
          peerStat['producerTransports'] = [...e, ...peerStat['producerTransports']]
=======
          peerStat[consumer.id] = e
>>>>>>> 7a514cf696c5ec26fe974e2af6b2e103fb0e2853
        } catch (error) {
          reject(error)
        }
      }))

      await Promise.all(this.consumerTransports.map(async (transport) => {
        try {
          const e = await transport.getStats()
<<<<<<< HEAD
          peerStat['consumerTransports'] = [...e, ...peerStat['consumerTransports']]
=======
          peerStat[transport.id] = e
>>>>>>> 7a514cf696c5ec26fe974e2af6b2e103fb0e2853
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
