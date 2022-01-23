exports.createMetricDescriptor = async (client) => {
    const projectId = 'vide-336112';
    const request = {
        name: client.projectPath(projectId),
        metricDescriptor: {
            description: 'Total Consumers from all VMs.',
            displayName: 'Consumer Count',
            type: 'custom.googleapis.com/consumer_count',
            metricKind: 'GAUGE',
            valueType: 'DOUBLE',
        },
    };

    // Creates a custom metric descriptor
    const [descriptor] = await client.createMetricDescriptor(request);

    console.log('Created custom Metric:\n');
    console.log(`Name: ${descriptor.displayName}`);
    console.log(`Description: ${descriptor.description}`);
    console.log(`Type: ${descriptor.type}`);
    console.log(`Kind: ${descriptor.metricKind}`);
    console.log(`Value Type: ${descriptor.valueType}`);
}
