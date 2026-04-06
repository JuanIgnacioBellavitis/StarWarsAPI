import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export type Movie = {
  id: string;
  title: string;
  releaseYear: number;
  director: string;
};

type CreateMovieInput = Omit<Movie, 'id'>;
type UpdateMovieInput = Partial<CreateMovieInput>;

@Injectable()
export class MoviesService {
  private readonly movies: Movie[] = [];

  findAll(): Movie[] {
    return this.movies;
  }

  findById(id: string): Movie {
    const movie = this.movies.find((item) => item.id === id);
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }

  create(payload: CreateMovieInput): Movie {
    const movie: Movie = {
      id: randomUUID(),
      ...payload,
    };
    this.movies.push(movie);
    return movie;
  }

  update(id: string, payload: UpdateMovieInput): Movie {
    const current = this.findById(id);
    const updated = { ...current, ...payload };
    const index = this.movies.findIndex((item) => item.id === id);
    this.movies[index] = updated;
    return updated;
  }

  remove(id: string): { deleted: boolean } {
    const index = this.movies.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new NotFoundException('Movie not found');
    }

    this.movies.splice(index, 1);
    return { deleted: true };
  }
}
