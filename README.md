# amqp-publisher

A simple library to publish messages to queues managed by AMQP brokers using amqplib and amqp-connection-manager

## requirements

* Node v18.16.0+

## usage

```sh
npm i @xplora-uk/amqp-publisher
```

See `./example/index.js`

## maintenance

### installation

```sh
npm i
```

### code

```plain
src/
  __tests__/
    component/      component tests
  index.ts          main file that exports features of this library
```

### build

```sh
npm run build
```

### tests

You can run tests with/without coverage info.

```sh
npm run test:coverage
```

### publish

It is important to increment version number using semantic versioning in `package.json` and re-create `package-lock.json`

```sh
# https://docs.npmjs.com/cli/v9/commands/npm-login
# using a member in xplora-uk
npm login

# https://docs.npmjs.com/cli/v9/commands/npm-publish
npm publish --access public
```
