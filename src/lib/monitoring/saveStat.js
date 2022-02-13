exports.saveStat = async (payload, client) => {
    // TODO(developer): Uncomment these lines and replace with your values.
    const project = 'vide-336112';
    const queue = 'reporter';
    const location = 'us-central1';
    const url = 'https://us-central1-vide-336112.cloudfunctions.net/saveStat';

    // Construct the fully qualified queue name.
    const parent = client.queuePath(project, location, queue);

    const task = {
        httpRequest: {
            httpMethod: 'POST',
            url,
        },
    };

    if (payload) {
        task.httpRequest.body = payload;
    }

    // Send create task request.
    console.log('Sending task:');
    console.log(task);
    const request = { parent: parent, task: task };
    const [response] = await client.createTask(request);
    console.log(`Created task ${response.name}`);
}
