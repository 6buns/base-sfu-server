const createWebRtcTransport = async (router) => {
    return new Promise(async (resolve, reject) => {
        try {
            const webRtcTransport = await router.createWebRtcTransport({
                listenIps: [
                    {
                        ip: metadata.ip || '0.0.0.0',
                        announcedIp: metadata.announcedIp || '192.168.1.37',
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
