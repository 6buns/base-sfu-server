import { Client, Entity, Schema, Repository } from 'redis-om';

const client = new Client();

async function connect() {
    if (!client.isOpen()) {
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

export async function createRoom(id) {
    await connect();

    const repository = new Repository(schema, client);

    const room = repository.createEntity({ id, ip: metadata.ip, announcedIp: metadata.announcedIp });

    const id = await repository.save(room);

    return id
}

export async function createIndex() {
    await connect();

    const repository = new Repository(schema, client);

    await repository.createIndex();
}

export async function findRoom(id) {
    await connect();

    const repository = new Repository(schema, client);

    const room = await repository.search.where('id').equals(id).and('source').true().return.first()

    return room

}
