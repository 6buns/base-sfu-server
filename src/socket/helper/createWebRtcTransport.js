const createWebRtcTransport = async (router) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(metadata)
            const webRtcTransport = await router.createWebRtcTransport({
                listenIps: [
                    {
                        ip: metadata.ip,
                        announcedIp: metadata.announcedIp
                    },
                ],
                enableUdp: true,
                enableTcp: true,
                preferUdp: true,
            });

            webRtcTransport.on("dtlsstatechange", (dtlsState) => {
                if (dtlsState === "closed") {
                    webRtcTransport.close();
                }
            });

            webRtcTransport.on("close", () => {
                console.log("webRtcTransport closed");
            });

            resolve(webRtcTransport);
        } catch (error) {
            reject(error);
        }
    });
};

exports.createWebRtcTransport = createWebRtcTransport;
