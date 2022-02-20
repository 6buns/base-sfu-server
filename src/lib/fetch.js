const http = require("http");
const { Buffer } = require('buffer');

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
                    resolve(data);
                });
            })
            .on("error", (err) => {
                reject(err);
            });
    });
};

exports.triggerCloudFunction = async (data, name) => {
    const dataEncoded = Buffer.from(JSON.stringify(data)).toString('base64')

    const options = {
        hostname: 'https://us-central1-vide-336112.cloudfunctions.net',
        path: `${name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        },
        body: dataEncoded
    }

    return new Promise((resolve, reject) => {
        http.request(options, (res) => {
            if (res.statusCode !== 200) reject(`Request Failed, Status Code: ${res.statusCode}`)
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                resolve(data);
            });
        }).on("error", (err) => {
            reject(err);
        })
    })
}
