import type { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';

export interface IAmqpPublisher {
  conn: AmqpConnectionManager;

  channelsByInternalQueueName: Record<string, ChannelWrapper>;

  realQueueByInternalName    : Record<string, string>;
  durableQueuesByInternalName: Array<string>;

  heartbeatIntervalMs: number;
  connectTimeoutMs   : number;
  publishTimeoutMs   : number;

  logPrefix: () => string;

  start: () => Promise<IAmqpPublisherResponse>;
  stop : () => Promise<IAmqpPublisherResponse>;

  publish      : (channel: ChannelWrapper, queue: string, message: Buffer) => Promise<IAmqpPublisherResponse>;
  publishString: (queue: string, message: string) => Promise<IAmqpPublisherResponse>;
  publishJson  : (queue: string, message: any) => Promise<IAmqpPublisherResponse>;
  publishJson5 : (queue: string, message: any) => Promise<IAmqpPublisherResponse>;
}

export class AmqpPublisherError extends Error {
  name = 'AmqpPublisherError';
  constructor(public message: string, public error?: Error | null) {
    super(message);
  }
}

export interface IAmqpPublisherResponse {
  success: boolean;
  errors?: AmqpPublisherError[] | null;
}

export interface IAmqpPublisherLegacyConfig {
  PROTOCOL    ?: string;
  HOSTNAME    ?: string;
  PORT        ?: number;
  USERNAME    ?: string;
  PASSWORD    ?: string;
  VHOST       ?: string;
  CA_FILE_PATH?: string;
  HEART_BEAT  ?: number;
  CHANNEL     ?: Array<{
    name     : string;
    isDelay ?: boolean;
    QUEUE   ?: Array<string>;
    prefetch?: number;
  }>;
}

export interface IAmqpPublisherSettings {
  realQueueByInternalName?    : Record<string, string>;
  durableQueuesByInternalName?: Array<string>;

  heartbeatIntervalMs?: number;
  connectTimeoutMs?   : number;
  publishTimeoutMs?   : number;
}
