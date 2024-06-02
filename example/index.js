const lib = require('../lib');

const settings = {
  realQueueByInternalName: {
    // internal name => real name
    'test1': 'TEST_1',
    'test2': 'test2',
  },
  durableQueuesByInternalName: [
    'test1',
  ],
};

main();
mainWithLegacyConf();

async function main() {
  const conf = {
    protocol: 'amqp',
    hostname: '127.0.0.1',
    port    : 5672,
    username: 'guest',
    password: 'guest',
    vhost   : '/',
  };
  const publisher = new lib.AmqpPublisher(conf, settings);
  await runTests(publisher, 'AmqpPublisher');
}

async function mainWithLegacyConf() {
  const conf = {
    HOSTNAME: '127.0.0.1',
    PORT    : 5672,
    USERNAME: 'guest',
    PASSWORD: 'guest',
    VHOST   : '/',
  };
  const publisher = new lib.AmqpPublisherWithLegacyConfig(conf, settings);
  await runTests(publisher, 'AmqpPublisherWithLegacyConfig');
}

async function runTests(publisher, from = '') {
  await publisher.start();
  const result1 = await publisher.publishJson('test1', { message: 'Hello World 1 from ' + from });
  console.log(result1);
  const result2 = await publisher.publishJson('test2', { message: 'Hello World 2 from ' + from });
  console.log(result2);
  await publisher.stop();
}
