import { AmqpPublisher } from './AmqpPublisher';
import type { Options } from 'amqp-connection-manager';
import { IAmqpPublisherLegacyConfig } from './types';

export class LegacyAmqpPublisher extends AmqpPublisher {
  constructor(
    legacyConfig: IAmqpPublisherLegacyConfig,
    realQueueByInternalName: Record<string, string> = {},
    durableQueuesByInternalName: Record<string, boolean> = {},
    heartbeatIntervalMs = 5000,
  ) {
    super(
      convertLegacyConfig(legacyConfig, heartbeatIntervalMs),
      realQueueByInternalName,
      durableQueuesByInternalName,
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
