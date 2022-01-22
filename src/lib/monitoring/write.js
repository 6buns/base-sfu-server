async function writeTimeSeriesData(val, client) {
  /**
   * TODO(developer): Uncomment and edit the following lines of code.
   */
  const projectId = 'vide-336112';

  const dataPoint = {
    interval: {
      endTime: {
        seconds: Date.now() / 1000,
      },
    },
    value: {
      doubleValue: val,
    },
  }


  const timeSeriesData = {
    metric: {
      type: 'custom.googleapis.com/consumer_count',
    },
    resource: {
      type: 'global',
    },
    points: [dataPoint],
  };

  const request = {
    name: client.projectPath(projectId),
    timeSeries: [timeSeriesData],
  };

  // Writes time series data
  const result = await client.createTimeSeries(request);
}

exports.writeTimeSeriesData = writeTimeSeriesData;
