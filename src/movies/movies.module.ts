import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../common/guards/roles.guard';
import { Person } from '../swapi-sync/entities/person.entity';
import { Planet } from '../swapi-sync/entities/planet.entity';
import { Species } from '../swapi-sync/entities/species.entity';
import { Starship } from '../swapi-sync/entities/starship.entity';
import { Vehicle } from '../swapi-sync/entities/vehicle.entity';
import { MoviesController } from './movies.controller';
import { Movie } from './entities/movie.entity';
import { MoviesService } from './movies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Person, Planet, Species, Starship, Vehicle])],
  controllers: [MoviesController],
  providers: [MoviesService, RolesGuard],
})
export class MoviesModule {}
