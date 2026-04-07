import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  async findAll(): Promise<MovieResponseDto[]> {
    const movies = await this.moviesRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['characters', 'planets', 'species', 'starships', 'vehicles'],
    });
    return movies.map(MovieResponseDto.fromEntity);
  }

  async findById(id: string): Promise<MovieResponseDto> {
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: ['characters', 'planets', 'species', 'starships', 'vehicles'],
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
