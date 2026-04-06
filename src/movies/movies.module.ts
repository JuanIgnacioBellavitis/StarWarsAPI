import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, RolesGuard],
})
export class MoviesModule {}
