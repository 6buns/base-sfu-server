"use strict";
const express = require("express");
const os = require("os");
const { Buffer } = require('buffer');
const fs = require("fs");
const https = require("https");
const http = require("http");

require("dotenv").config();

// Constants
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
const { fetchMeta, triggerCloudFunction } = require("./src/lib/fetch");
const { keygen, keyVerify } = require("./src/socket/helper/keygen");
// const { findRoomInRedis } = require("./src/lib/redis");
const { Firestore } = require("@google-cloud/firestore");

// Imports the Google Cloud Tasks library.
const { CloudTasksClient } = require("@google-cloud/tasks");
// Instantiates a client.
const client = new CloudTasksClient();

const db = new Firestore();

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


// http.createServer(app).listen(80);

const options = {
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt')
}

const server = https.createServer(options, app)
server.listen(443);


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
    logTags: ["ice", "dtls"],
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

reportingInterval = setInterval(async () => {
  if (rooms.size > 0) {
    for (const [id, room] of rooms) {
      try {
        const e = await room._getRoomStat()
        console.log(e);

        const statDecoded = Buffer.from(JSON.stringify({ ...e })).toString('base64')

        client
          .createTask({
            parent: client.queuePath("vide-336112", "us-central1", "reporter"),
            task: {
              httpRequest: {
                httpMethod: "POST",
                url: "https://us-central1-vide-336112.cloudfunctions.net/saveStat",
                body: statDecoded,
              },
            },
          })
          .then((e) => console.log(`Created task ${e.name}`))
          .catch((e) => console.error(`Unable to create task ${e}`));
      } catch (error) {
        console.error(error)
      }
    }
  }
}, 5000);

mediasoup.observer.on("newworker", (worker) => {
  console.log("new worker created [worke.pid:%d]", worker.pid);

  worker.observer.on("close", () => {
    console.log("worker closed [worker.pid:%d]", worker.pid);
    clearInterval(reportingInterval);
  });

  worker.observer.on("newrouter", (router) => {
    console.log(
      "new router created [worker.pid:%d, router.id:%s]",
      worker.pid,
      router.id
    );

    router.observer.on("close", async () => {
      console.log("router closed [router.id:%s]", router.id);
      let id;
      rooms.forEach((value, key) => {
        id = router.id === value.router.id ? key : ''
      })
      await triggerCloudFunction({ id }, 'cleanRoomSession');
      rooms.delete(router.id);
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
        rooms.forEach((room, key) => {
          room
        })
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

        consumer.observer.on("close", () => {
          console.log("consumer closed [consumer.id:%s]", consumer.id);
        });
      });
    });
  });
});
