import amqp from 'amqp-connection-manager';
import type { AmqpConnectionManager, Channel, ChannelWrapper, Options } from 'amqp-connection-manager';
import JSON5 from 'json5';
import { AmqpPublisherError, IAmqpPublisher, IAmqpPublisherResponse } from './types';

export class AmqpPublisher implements IAmqpPublisher {
  public name = 'AmqpPublisher';

  public conn: AmqpConnectionManager;

  // internal queue name to channel mapping
  public channelsByInternalQueueName: { [key: string]: ChannelWrapper } = {};

  // internal queue name to real queue name mapping
  public realQueueByInternalName: Record<string, string> = {};

  // internal queue name to durable mapping - by default all queues are non-durable
  public durableQueuesByInternalName: Record<string, boolean> = {};

  public heartbeatIntervalMs = 5000;

  public connectTimeoutMs = 5000;

  public publishTimeoutMs = 5000;

  constructor(
    public options: Options.Connect,
    realQueueByInternalName: Record<string, string> = {},
    durableQueuesByInternalName: Record<string, boolean> = {},
  ) {
    if (realQueueByInternalName) this.realQueueByInternalName = realQueueByInternalName;
    if (durableQueuesByInternalName) this.durableQueuesByInternalName = durableQueuesByInternalName;

    this.conn = amqp.connect(options);

    this.conn.on('connect', this.onConnect);
    this.conn.on('disconnect', this.onDisconnect);
  }

  logPrefix = () => `AmqpClient ${this.name} - `;

  start = async (): Promise<IAmqpPublisherResponse> => {
    await this.conn.connect({ timeout: this.connectTimeoutMs });
    await Promise.all(
      Object.getOwnPropertyNames(this.realQueueByInternalName).map(internalQueue => {
        const realQueue = this.realQueueByInternalName[internalQueue];
        return this.openChannelForQueue(internalQueue, realQueue);
      }),
    );
    return {
      success: true,
      // TODO: collect errors
    };
  };

  closeChannels = async (): Promise<AmqpPublisherError | null> => {
    try {
      await Promise.allSettled(
        Object.getOwnPropertyNames(this.channelsByInternalQueueName).map(q => this.closeChannelForQueue(q)),
      );
      return null;
    } catch (error: any) {
      const errMsg = `${this.logPrefix()} error closing channels`;
      return new AmqpPublisherError(errMsg, error instanceof Error ? error : null);
    }
  }

  closeConnection = async (): Promise<AmqpPublisherError | null> => {
    try {
      await this.conn.close();
      return null;
    } catch (error: any) {
      const errMsg = `${this.logPrefix()} error closing connection`;
      return new AmqpPublisherError(errMsg, error instanceof Error ? error : null);
    }
  }

  stop = async (): Promise<IAmqpPublisherResponse> => {
    const errors: AmqpPublisherError[] = [];

    const result1 = await this.closeChannels();
    if (result1) errors.push(result1);

    const result2 = await this.closeConnection();
    if (result2) errors.push(result2);

    return {
      success: result1 === null && result2 === null,
      errors,
    };
  };

  openChannelForQueue = (
    internalQueueName: string,
    realQueueName: string,
    durable = this.durableQueuesByInternalName[internalQueueName] || false,
  ): ChannelWrapper => {
    const channel = this.conn.createChannel({
      json: false,
      setup: async (ch: Channel) => {
        await ch.assertQueue(realQueueName, { durable });
      },
    });
    this.channelsByInternalQueueName[internalQueueName] = channel;
    return channel;
  };

  closeChannelForQueue = async (queueName: string): Promise<void> => {
    const channel = this.channelsByInternalQueueName[queueName];
    if (channel) {
      try {
        await channel.close();
      } catch (error: any) {
        this.onChannelCloseError(queueName, error);
      }
      delete this.channelsByInternalQueueName[queueName];
    }
  };

  onChannelCloseError = (queue: string, err: Error | any) => {
    console.error(`${this.logPrefix()} error closing channel for queue ${queue}`, err);
  }

  onConnect = () => {
    console.info(`${this.logPrefix()} connected`);
  };

  onDisconnect = () => {
    console.warn(`${this.logPrefix()} disconnected`);
  };

  protected _queueNotFound = (queue: string): IAmqpPublisherResponse => {
    const errMsg = `${this.logPrefix()} queue ${queue} not found`;
    return {
      success: false,
      errors: [new AmqpPublisherError(errMsg)],
    };
  };

  publish = async (channel: ChannelWrapper, queue: string, message: Buffer): Promise<IAmqpPublisherResponse> => {
    let success = false, errors: AmqpPublisherError[] = [];

    try {
      success = await channel.sendToQueue(queue, message);
    } catch (error: any) {
      const errMsg = `${this.logPrefix()} error publishing message to queue ${queue}`;
      errors.push(new AmqpPublisherError(errMsg, error instanceof Error ? error : null));
    }

    return {
      success,
      errors,
    };
  };

  publishString = async (queue: string, message: string): Promise<IAmqpPublisherResponse> => {
    const channel = this.channelsByInternalQueueName[queue];
    if (!channel) return this._queueNotFound(queue);

    const msgBuffer = Buffer.from(message);
    return this.publish(channel, queue, msgBuffer);
  };

  publishJson = async <T = any>(queue: string, message: T): Promise<IAmqpPublisherResponse> => {
    try {
      const msgStr = JSON.stringify(message);
      return this.publishString(queue, msgStr);
    } catch (error: any) {
      const errMsg = `${this.logPrefix()} error serializing message to JSON`;
      return {
        success: false,
        errors: [new AmqpPublisherError(errMsg, error instanceof Error ? error : null)],
      };
    }
  };

  publishJson5 = async <T = any>(queue: string, message: T): Promise<IAmqpPublisherResponse> => {
    try {
      const msgStr = JSON5.stringify(message);
      return this.publishString(queue, msgStr);
    } catch (error: any) {
      const errMsg = `${this.logPrefix()} error serializing message to JSON5`;
      return {
        success: false,
        errors: [new AmqpPublisherError(errMsg, error instanceof Error ? error : null)],
      };
    }
  };
}
