import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';

/** Users data access. Exported for the auth module (card 001-03); no HTTP endpoints of its own. */
@Module({
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
