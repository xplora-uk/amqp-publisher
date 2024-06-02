import { connect } from 'amqp-connection-manager';
import type { AmqpConnectionManager, Options } from 'amqp-connection-manager';
import { AmqpPublisher } from './AmqpPublisher';
import { IAmqpPublisherLegacyConfig, IAmqpPublisherSettings } from './types';

export class AmqpPublisherWithLegacyConfig extends AmqpPublisher {
  public name = 'AmqpPublisherWithLegacyConfig';
  constructor(
    legacyConfig: IAmqpPublisherLegacyConfig,
    settings: IAmqpPublisherSettings = { heartbeatIntervalMs: 5000 },
    options = convertLegacyConfig(legacyConfig, settings.heartbeatIntervalMs),
    conn: AmqpConnectionManager = connect(options),
  ) {
    super(
      options,
      settings,
      conn,
    );
  }
}

export function convertLegacyConfig(
  conf: IAmqpPublisherLegacyConfig,
  heartbeatIntervalMs = 5000,
  connectTimeoutMs = 5000,
): Options.Connect {
  const protocol = conf.PROTOCOL || 'amqp';
  const hostname = conf.HOSTNAME || 'localhost';
  const port     = conf.PORT || 5671;
  return {
    protocol,
    hostname,
    port,
    username : conf.USERNAME || '',
    password : conf.PASSWORD || '',
    vhost    : conf.VHOST || '/',
    heartbeat: conf.HEART_BEAT || heartbeatIntervalMs,
    timeout  : connectTimeoutMs,
  };
}
