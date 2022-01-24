const { Client, Entity, Schema, Repository } = require('redis-om');

const client = new Client();

async function connect() {
    if (!client.isOpen()) {
        console.log('Trying to Connect.')
        await client.open(`redis://:${process.env.REDIS_PASS}@${process.env.REDIS_URL}`)
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

const createRoomInRedis = async function (id) {
    await connect();

    const repository = new Repository(schema, client);

    const room = repository.createEntity({ id, ip: metadata.ip, announcedIp: metadata.announcedIp });

    const rid = await repository.save(room);

    return rid
}

const createIndexInRedis = async function () {
    await connect();

    const repository = new Repository(schema, client);

    await repository.createIndex();
}

const findRoomInRedis = async function (id) {
    await connect();

    const repository = new Repository(schema, client);

    let room;

    try {
        room = await repository.search().where('id').equals(id).and('source').true().return.first()
    } catch (error) {
        await createIndexInRedis()
        room = await repository.search().where('id').equals(id).and('source').true().return.first()
    }

    return room

}

exports.findRoomInRedis = findRoomInRedis
exports.createRoomInRedis = createRoomInRedis
