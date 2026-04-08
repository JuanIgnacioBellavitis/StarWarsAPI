import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Person } from '../swapi-sync/entities/person.entity';
import { Planet } from '../swapi-sync/entities/planet.entity';
import { Species } from '../swapi-sync/entities/species.entity';
import { Starship } from '../swapi-sync/entities/starship.entity';
import { Vehicle } from '../swapi-sync/entities/vehicle.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MOVIE_RELATIONS = ['characters', 'planets', 'species', 'starships', 'vehicles'];

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    @InjectRepository(Person)
    private readonly peopleRepository: Repository<Person>,
    @InjectRepository(Planet)
    private readonly planetsRepository: Repository<Planet>,
    @InjectRepository(Species)
    private readonly speciesRepository: Repository<Species>,
    @InjectRepository(Starship)
    private readonly starshipsRepository: Repository<Starship>,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
  ) {}

  private async resolveByUids<T extends { swapiUid: string }>(
    uids: string[],
    repo: Repository<T>,
    label: string,
  ): Promise<T[]> {
    if (!uids.length) return [];
    const entities = await repo.findBy({ swapiUid: In(uids) } as any);
    if (entities.length !== uids.length) {
      throw new BadRequestException(`One or more ${label} UIDs not found`);
    }
    return entities;
  }

  async findAll(): Promise<MovieResponseDto[]> {
    const movies = await this.moviesRepository.find({
      order: { createdAt: 'DESC' },
      relations: MOVIE_RELATIONS,
      relationLoadStrategy: 'query',
    });
    return movies.map(MovieResponseDto.fromEntity);
  }

  async findById(identifier: string): Promise<MovieResponseDto> {
    const where = UUID_REGEX.test(identifier)
      ? { id: identifier }
      : { swapiUid: identifier };

    const movie = await this.moviesRepository.findOne({
      where,
      relations: MOVIE_RELATIONS,
      relationLoadStrategy: 'query',
    });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return MovieResponseDto.fromEntity(movie);
  }

  async create(payload: CreateMovieDto): Promise<MovieResponseDto> {
    const { characterUids, planetUids, speciesUids, starshipUids, vehicleUids, ...scalarPayload } = payload;
    const movie = this.moviesRepository.create(scalarPayload);
    if (characterUids) movie.characters = await this.resolveByUids(characterUids, this.peopleRepository, 'character');
    if (planetUids) movie.planets = await this.resolveByUids(planetUids, this.planetsRepository, 'planet');
    if (speciesUids) movie.species = await this.resolveByUids(speciesUids, this.speciesRepository, 'species');
    if (starshipUids) movie.starships = await this.resolveByUids(starshipUids, this.starshipsRepository, 'starship');
    if (vehicleUids) movie.vehicles = await this.resolveByUids(vehicleUids, this.vehiclesRepository, 'vehicle');
    const saved = await this.moviesRepository.save(movie);
    return MovieResponseDto.fromEntity(saved);
  }

  async update(id: string, payload: UpdateMovieDto): Promise<MovieResponseDto> {
    const current = await this.moviesRepository.findOne({ where: { id } });
    if (!current) {
      throw new NotFoundException('Movie not found');
    }
    const { characterUids, planetUids, speciesUids, starshipUids, vehicleUids, ...scalarPayload } = payload;
    const updated = this.moviesRepository.merge(current, scalarPayload);
    if (characterUids !== undefined) updated.characters = await this.resolveByUids(characterUids, this.peopleRepository, 'character');
    if (planetUids !== undefined) updated.planets = await this.resolveByUids(planetUids, this.planetsRepository, 'planet');
    if (speciesUids !== undefined) updated.species = await this.resolveByUids(speciesUids, this.speciesRepository, 'species');
    if (starshipUids !== undefined) updated.starships = await this.resolveByUids(starshipUids, this.starshipsRepository, 'starship');
    if (vehicleUids !== undefined) updated.vehicles = await this.resolveByUids(vehicleUids, this.vehiclesRepository, 'vehicle');
    const saved = await this.moviesRepository.save(updated);
    return MovieResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const current = await this.moviesRepository.findOne({ where: { id } });
    if (!current) {
      throw new NotFoundException('Movie not found');
    }
    await this.moviesRepository.remove(current);
    return { deleted: true };
  }
}
