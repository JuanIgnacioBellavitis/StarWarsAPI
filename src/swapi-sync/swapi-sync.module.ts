import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../common/guards/roles.guard';
import { Movie } from '../movies/entities/movie.entity';
import { SwapiSyncController } from './swapi-sync.controller';
import { SwapiSyncService } from './swapi-sync.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Movie])],
  controllers: [SwapiSyncController],
  providers: [SwapiSyncService, RolesGuard],
})
export class SwapiSyncModule {}
