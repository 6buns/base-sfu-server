"use strict";

const express = require("express");

// Constants
const PORT = process.env.PORT || 8080;

// App
const app = express();
const http = require('http');
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/test", (req, res) => {
  res.send((new Date).toLocaleString());
});

server.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});


const mediasoup = require("mediasoup");
process.env.DEBUG = "mediasoup*";

import os from "os";

const ifaces = os.networkInterfaces();
global.localIp = "127.0.0.1";

const getLocalIp = () => {
  Object.keys(ifaces).forEach((ifname) => {
    for (const iface of ifaces[ifname] ?? []) {
      // Ignore IPv6 and 127.0.0.1
      if (iface.family !== "IPv4" || iface.internal !== false) {
        continue;
      }

      // Set the local ip to the first IPv4 address found and exit the loop
      localIp = iface.address;
      return;
    }
  });
};

const localIp = getLocalIp();

global.worker = {};
global.rooms = [];

(async () => {
  worker = await mediasoup.createWorker({
    logLevel: "debug",
    rtcMinPort: 40000,
    rtcMaxPort: 49999
  });
  console.log(`worker pid ${worker.pid}`);

  worker.on("died", (error) => {
    // This implies something serious happened, so kill the application
    console.error("mediasoup worker has died");
    setTimeout(() => process.exit(1), 2000); // exit in 2 seconds
  });
})();

const io = require("socket.io")(server);
require("./src/socket")(io);

mediasoup.observer.on("newworker", (worker) => {
  console.log("new worker created [worke.pid:%d]", worker.pid);

  worker.observer.on("close", () => {
    console.log("worker closed [worker.pid:%d]", worker.pid);
  });

  worker.observer.on("newrouter", (router) => {
    console.log(
      "new router created [worker.pid:%d, router.id:%s]",
      worker.pid,
      router.id
    );

    router.observer.on("close", () => {
      console.log("router closed [router.id:%s]", router.id);
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

        consumer.observer.on("close", () => {
          console.log("consumer closed [consumer.id:%s]", consumer.id);
        });
      });
    });
  });
});
