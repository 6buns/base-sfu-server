const { Client, Entity, Schema, Repository } = require('redis-om');

const client = new Client();

async function connect() {
    if (!client.isOpen()) {
        console.log('Trying to Connect.')
        await client.open(process.env.REDIS_URL)
    }
}

class Room extends Entity { }

let schema = new Schema(
    Room,
    {
        id: { type: 'string', textSearch: true },
        ip: { type: 'string' },
        announcedIp: { type: 'string' }
    }, {
    dataStructure: 'JSON'
}
)

exports.createRoomInRedis = async function (id) {
    await connect();

    const repository = new Repository(schema, client);

    const room = repository.createEntity({ id, ip: metadata.ip, announcedIp: metadata.announcedIp });

    const rid = await repository.save(room);

    return rid
}

exports.createIndexInRedis = async function () {
    await connect();

    const repository = new Repository(schema, client);

    await repository.createIndex();
}

exports.findRoomInRedis = async function (id) {
    await connect();

    const repository = new Repository(schema, client);

    const room = await repository.search.where('id').equals(id).and('source').true().return.first()

    return room

}
