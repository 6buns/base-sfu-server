const http = require("http");

exports.fetchMeta = async (url) => {
    return new Promise((resolve, reject) => {
        http
            .get({
                path: `http://metadata.google.internal/computeMetadata/v1/instance/${url}/`,
                headers: {
                    'Metadata-Flavor': 'Google'
                }
            }, (resp) => {
                let data = "";
                resp.on("data", (chunk) => {
                    data += chunk;
                });
                resp.on("end", () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        console.log(parsedData);
                        resolve(parsedData);
                    } catch (e) {
                        console.error(e.message);
                    }
                });
            })
            .on("error", (err) => {
                reject(err);
            });
    });
};
