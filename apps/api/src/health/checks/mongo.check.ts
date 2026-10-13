import { Inject, Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGO_CLIENT } from '../../infra/tokens.js';
import type { DependencyCheck } from '../dependency-check.js';

/** Healthy when MongoDB answers the `ping` command. */
@Injectable()
export class MongoCheck implements DependencyCheck {
  readonly name = 'mongo';

  constructor(@Inject(MONGO_CLIENT) private readonly client: MongoClient) {}

  /** Sends `{ ping: 1 }` to the default database; rejects if the server is unreachable. */
  async check(): Promise<void> {
    await this.client.db().command({ ping: 1 });
  }
}
