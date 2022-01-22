async function readTimeSeriesFields(client) {
    /**
     * TODO(developer): Uncomment and edit the following lines of code.
     */
    const projectId = 'vide-336112';

    const request = {
        name: client.projectPath(projectId),
        filter: 'metric.type="custom.googleapis.com/consumer_count"',
        interval: {
            startTime: {
                // Limit results to the last 20 minutes
                seconds: Date.now() / 1000 - 60 * 20,
            },
            endTime: {
                seconds: Date.now() / 1000,
            },
        },
    };

    // Writes time series data
    const [timeSeries] = await client.listTimeSeries(request);
    return timeSeries[timeSeries.length - 1]
}

exports.readTimeSeriesFields = readTimeSeriesFields;
