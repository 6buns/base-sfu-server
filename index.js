"use strict";

const express = require("express");

// Constants
const PORT = 8080;
const HOST = "0.0.0.0";

// App
const app = express();
const http = require('http');
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);


const mediasoup = require("mediasoup");
process.env.DEBUG = "mediasoup*";

global.worker;
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