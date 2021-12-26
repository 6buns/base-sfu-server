const { webRtcTransport_options } = require("../../../config/mediasoup");

const createWebRtcTransport = async (router) => {
    return new Promise(async (resolve, reject) => {
        try {
            const webRtcTransport = await router.createWebRtcTransport(
                webRtcTransport_options
            );

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
