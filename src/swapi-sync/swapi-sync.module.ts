import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../common/guards/roles.guard';
import { Movie } from '../movies/entities/movie.entity';
import { Person } from './entities/person.entity';
import { Planet } from './entities/planet.entity';
import { Species } from './entities/species.entity';
import { Starship } from './entities/starship.entity';
import { Vehicle } from './entities/vehicle.entity';
import { SwapiClient } from './swapi-client.service';
import { SwapiSyncController } from './swapi-sync.controller';
import { SwapiSyncService } from './swapi-sync.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Movie, Person, Planet, Species, Starship, Vehicle]),
  ],
  controllers: [SwapiSyncController],
  providers: [SwapiSyncService, SwapiClient, RolesGuard],
})
export class SwapiSyncModule {}
