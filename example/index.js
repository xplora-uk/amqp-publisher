const lib = require('./lib');

main()

async function main() {
  const publisher = await lib.AmqpPublisher({
    url: 'amqp://localhost',
  });

  publisher.publishJson('test', { message: 'Hello World' });
}
