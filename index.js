"use strict";
const express = require("express");
const os = require('os')

require('dotenv').config()

// Constants
const PORT = process.env.PORT || 8080;
const cpuCount = os.cpus().length;

// App
const app = express();
const http = require("http");
const server = http.createServer(app);
const monitoring = require('@google-cloud/monitoring');
const mediasoup = require("mediasoup");
const { fetchMeta } = require("./src/lib/fetch");
const { keygen, keyVerify } = require("./src/socket/helper/keygen");
const { writeTimeSeriesData } = require("./src/lib/monitoring/write");
const { readTimeSeriesFields } = require("./src/lib/monitoring/read");
const { createMetricDescriptor } = require("./src/lib/monitoring/create");

const moniteringClient = new monitoring.MetricServiceClient();
process.env.DEBUG = "mediasoup*";

global.arr = [];
global.salt = '';
global.consumerLimit = 100;
global.localConsumerCount = 0;
global.metadata = {};
global.indexNotCreated = true;


app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/test", (req, res) => {
  res.send(new Date().toLocaleString());
});

app.get('/key', (req, res) => {
  res.status(200).json({
    key: keygen()
  })
})

server.listen(PORT, () => {
  console.log(process.env.REDIS_URL);
  console.log(`Running on ${PORT}`);
});

(async () => {
  try {
    metadata.id = ''
    metadata.id = await fetchMeta('id')

    metadata.ip = ''
    metadata.ip = await fetchMeta('network-interfaces/0/ip')

    metadata.announcedIp = ''
    metadata.announcedIp = await fetchMeta('network-interfaces/0/access-configs/0/external-ip')
  } catch (error) {
    console.log(error)
  }

  arr = new Array(5).fill('').map((e, i) => ~~(Math.random() * 39))
  salt = new Array(39).fill('').map(e => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz'[~~(Math.random() * 62)]).join('')
})()

global.worker = {};
global.rooms = [];

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

const io = require("socket.io")(server);

io.use((socket, next) => {
  if (keyVerify(socket.handshake.auth.key)) {
    next();
  } else {
    next(new Error("unauthorized"))
  }
})

require("./src/socket")(io);

mediasoup.observer.on("newworker", (worker) => {
  console.log("new worker created [worke.pid:%d]", worker.pid);

  (async () => {
    try {
      const timeseries = await readTimeSeriesFields(moniteringClient)
      timeseries.length > 1 && timeseries.forEach(e => {
        e.points.forEach(p => {
          if (JSON.stringify(p.value) !== '0') {
            localConsumerCount = p.value
          }
        })
      });
    } catch (error) {
      await createMetricDescriptor(moniteringClient)
    } finally {
      await writeTimeSeriesData(localConsumerCount, moniteringClient);
    }
  })()

  worker.observer.on("close", () => {
    console.log("worker closed [worker.pid:%d]", worker.pid);
  });

  worker.observer.on("newrouter", (router) => {
    console.log(
      "new router created [worker.pid:%d, router.id:%s]",
      worker.pid,
      JSON.stringify(rooms)
    );

    router.observer.on("close", () => {
      console.log("router closed [router.id:%s]", JSON.stringify(rooms));
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
        writeTimeSeriesData(localConsumerCount, moniteringClient);

        consumer.observer.on("close", () => {
          console.log("consumer closed [consumer.id:%s]", consumer.id);

          localConsumerCount -= 1;
          writeTimeSeriesData(localConsumerCount, moniteringClient);
        });
      });
    });
  });
});
