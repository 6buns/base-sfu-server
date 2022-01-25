const http = require("http");

exports.fetchMeta = async (url) => {
    return new Promise((resolve, reject) => {
        http
            .get({
                hostname: 'metadata.google.internal',
                path: `/computeMetadata/v1/instance/${url}`,
                headers: {
                    'Metadata-Flavor': 'Google'
                }
            }, (res) => {
                if (res.statusCode !== 200) reject(`Request Failed, Status Code: ${res.statusCode}`)
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    resolve(JSON.parse(data));
                });
            })
            .on("error", (err) => {
                reject(err);
            });
    });
};
