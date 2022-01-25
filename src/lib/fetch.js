const http = require("http");

exports.fetchMeta = async (url) => {
    return new Promise((resolve, reject) => {
        http
            .get({
                path: `http://metadata.google.internal/computeMetadata/v1/instance/${url}`,
                headers: {
                    'Metadata-Flavor': 'Google'
                }
            }, (resp) => {
                let data = "";
                resp.on("data", (chunk) => {
                    data += chunk;
                });
                resp.on("end", () => {
                    resolve(data);
                });
            })
            .on("error", (err) => {
                reject(err);
            });
    });
};
