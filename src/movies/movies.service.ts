import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  async findAll(): Promise<Movie[]> {
    return this.moviesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }

  async create(payload: CreateMovieDto): Promise<Movie> {
    const movie = this.moviesRepository.create(payload);
    return this.moviesRepository.save(movie);
  }

  async update(id: string, payload: UpdateMovieDto): Promise<Movie> {
    const current = await this.findById(id);
    const updated = this.moviesRepository.merge(current, payload);
    return this.moviesRepository.save(updated);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const current = await this.findById(id);
    await this.moviesRepository.remove(current);
    return { deleted: true };
  }
}
