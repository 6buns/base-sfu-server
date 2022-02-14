"use strict";
const express = require("express");
const os = require("os");

require("dotenv").config();

// Constants
const PORT = process.env.PORT || 80;
const cpuCount = os.cpus().length;
// const crypto = require('crypto')
// const jose = require('jose')
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Redis = require("ioredis");

// App
const app = express();
// const monitoring = require('@google-cloud/monitoring');
const mediasoup = require("mediasoup");
const { fetchMeta } = require("./src/lib/fetch");
const { keygen, keyVerify } = require("./src/socket/helper/keygen");
const { findRoomInRedis } = require("./src/lib/redis");
const { Firestore } = require("@google-cloud/firestore");

// Imports the Google Cloud Tasks library.
const { CloudTasksClient } = require("@google-cloud/tasks");
// Instantiates a client.
const client = new CloudTasksClient();

const db = new Firestore();

process.env.DEBUG = "mediasoup*";

global.consumerLimit = 100;
global.localConsumerCount = 0;
global.metadata = {};

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/test", (req, res) => {
  res.send(new Date().toLocaleString());
});

app.get("/key", (req, res) => {
  res.status(200).json({
    key: keygen(),
  });
});

const server = app.listen(PORT, () => {
  console.log(process.env.REDIS_URL);
  console.log(`Running on ${PORT}`);
});

(async () => {
  try {
    metadata.id = "";
    metadata.id = await fetchMeta("id");

    metadata.ip = "";
    metadata.ip = await fetchMeta("network-interfaces/0/ip");

    metadata.announcedIp = "";
    metadata.announcedIp = await fetchMeta(
      "network-interfaces/0/access-configs/0/external-ip"
    );
  } catch (error) {
    console.log(error);
  }
})();

global.worker = {};
global.rooms = new Map();
global.reportingInterval = {};

(async () => {
  worker = await mediasoup.createWorker({
    logLevel: "debug",
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
  });
  console.log(`worker pid ${worker.pid}`);

  worker.on("died", (error) => {
    // This implies something serious happened, so kill the application
    console.error("mediasoup worker has died");
    setTimeout(() => process.exit(1), 2000); // exit in 2 seconds
  });
})();

// const pubClient = new Redis(`redis://:${process.env.REDIS_PASS}@${process.env.REDIS_URL}`);
// const subClient = pubClient.duplicate();
// const keyStoreRef = db.collection('keyStore')

const io = new Server(server);
// io.adapter(createAdapter(pubClient, subClient));
// io.listen(server);

// io.use((socket, next) => {
//   const apiHash = crypto.createHash('md5').update(socket.handshake.auth.key).digest('hex');
//   // let secret = '';
//   const doc = await keyStoreRef.where('key', '==', apiHash).get();
//   if (!doc.exists) {
//     next(new Error("Unauthorized"))
//   } else {
//     const { uid } = doc.data();
//     socket.uid = uid
//   }
//   // apiSnapshot.forEach(doc => ({ secret, scopes } = doc.data()))
//   // jose.jwtVerify(socket.handshake.auth.jwt, secret).then(({ payload }) => {
//   //   next();
//   // }).catch((err) => {
//   // })
// })

require("./src/socket")(io);

reportingInterval = setInterval(() => {
  if (rooms.size > 1) {
    rooms.forEach((room) => {
      let roomStat = {};
      console.log(`Stat saving of ${room.name}`);

      for (let k = 0; k < room.peers.length; k++) {
        const peer = room.peers[k];
        let peerStat = {};
        for (let l = 0; l < peer.consumers.length; l++) {
          // peerStat[consumer.id] = await consumer.getStats();
          peer.consumers[l]
            .getStats()
            .then((e) => (peerStat[consumer.id] = e))
            .catch((e) => (peerStat[consumer.id] = ""));
        }

        for (let m = 0; m < peer.consumerTransports.length; m++) {
          // peerStat[transport.id] = await transport.getStats();
          peer.consumerTransports[m]
            .getStats()
            .then((e) => (peerStat[transport.id] = e))
            .catch((e) => (peerStat[transport.id] = ""));
        }

        roomStat[peer.id] = { ...peerStat };
      }

      if (room.pipeTransport !== {}) {
        // roomStat["pipeTransport"] = await room.pipeTransport.getStats();
        room.pipeTransport
          .getStats()
          .then((e) => (peerStat["pipeTransport"] = e))
          .catch((e) => (peerStat["pipeTransport"] = ""));
      }

      roomStat["name"] = room.name;
      roomStat["routerId"] = room.router.id;

      client
        .createTask({
          parent: client.queuePath("vide-336112", "us-central1", "reporter"),
          task: {
            httpRequest: {
              httpMethod: "POST",
              url: "https://us-central1-vide-336112.cloudfunctions.net/saveStat",
              body: JSON.stringify({ ...roomStat }),
            },
          },
        })
        .then((e) => console.log(`Created task ${response.name}`))
        .catch((e) => console.error(`Unable to create task ${response.name}`));
    });
  }
}, 60000);

mediasoup.observer.on("newworker", async (worker) => {
  console.log("new worker created [worke.pid:%d]", worker.pid);

  worker.observer.on("close", () => {
    console.log("worker closed [worker.pid:%d]", worker.pid);
    clearInterval(reportingInterval);
  });

  worker.observer.on("newrouter", async (router) => {
    console.log(
      "new router created [worker.pid:%d, router.id:%s]",
      worker.pid,
      `Rooms : ${rooms.size}`
    );

    router.observer.on("close", async () => {
      console.log("router closed [router.id:%s]", `Rooms : ${rooms.size}`);

      rooms.delete(router.id);

      // // remove original room from redis.
      // rooms.forEach(room => {
      //   if (room.router.id === router.id) {
      //     const roomRedis = await findRoomInRedis(room.name)
      //     if (roomRedis) {
      //       removeRoom(roomRedis)
      //     }
      //   }
      // });
    });

    router.observer.on("newtransport", (transport) => {
      console.log(
        "new transport created [worker.pid:%d, router.id:%s, transport.id:%s]",
        worker.pid,
        router.id,
        transport.id
      );

      transport.observer.on("close", () => {
        console.log("transport closed [transport.id:%s]", transport.id);
      });

      transport.observer.on("newproducer", (producer) => {
        console.log(
          "new producer created [worker.pid:%d, router.id:%s, transport.id:%s, producer.id:%s]",
          worker.pid,
          router.id,
          transport.id,
          producer.id
        );

        producer.observer.on("close", () => {
          console.log("producer closed [producer.id:%s]", producer.id);
        });
      });

      transport.observer.on("newconsumer", (consumer) => {
        console.log(
          "new consumer created [worker.pid:%d, router.id:%s, transport.id:%s, consumer.id:%s]",
          worker.pid,
          router.id,
          transport.id,
          consumer.id
        );

        localConsumerCount += 1;

        consumer.observer.on("close", () => {
          console.log("consumer closed [consumer.id:%s]", consumer.id);

          localConsumerCount -= 1;
        });
      });
    });
  });
});
