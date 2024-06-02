# amqp-publisher

A simple library to publish messages to queues managed by AMQP brokers using amqplib and amqp-connection-manager

## requirements

* Node v18.16.0+

## usage

```sh
npm i @xplora-uk/amqp-publisher
```

See `./example/index.js`

```js
const connectionConfig = {
  protocol: 'amqp',
  hostname: '127.0.0.1',
  port    : 5672,
  username: 'guest',
  password: 'guest',
  vhost   : '/',
};
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
const publisher = new AmqpPublisher(connectionConfig, settings);
await publisher.start();
const result1 = await publisher.publishJson('test1', { message: 'Hello World 1' });
console.log(result1);
const result2 = await publisher.publishJson('test2', { message: 'Hello World 2' });
console.log(result2);
await publisher.stop();
```

## maintenance

### installation

```sh
npm i
```

### code

```plain
src/
  AmqpPublisher.ts                  Generic AMQP publisher class
  AmqpPublisherWithLegacyConfig.ts  Extends generic publisher initiated with legacy connection options
  index.ts                          main file that exports features of this library
  types.ts                          TypeScript types
```

### build

```sh
npm run build
```

### tests

TODO

### publish

It is important to increment version number using semantic versioning in `package.json` and re-create `package-lock.json`

```sh
# https://docs.npmjs.com/cli/v9/commands/npm-login
# using a member in xplora-uk
npm login

# https://docs.npmjs.com/cli/v9/commands/npm-publish
npm publish --access public
```
