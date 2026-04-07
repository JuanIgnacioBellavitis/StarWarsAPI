import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

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
    const movie = this.moviesRepository.create(payload);
    const saved = await this.moviesRepository.save(movie);
    return MovieResponseDto.fromEntity(saved);
  }

  async update(id: string, payload: UpdateMovieDto): Promise<MovieResponseDto> {
    const current = await this.moviesRepository.findOne({ where: { id } });
    if (!current) {
      throw new NotFoundException('Movie not found');
    }
    const updated = this.moviesRepository.merge(current, payload);
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
