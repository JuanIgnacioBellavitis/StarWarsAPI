import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';

describe('MoviesService', () => {
  let moviesService: MoviesService;
  let repositoryMock: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    merge: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    repositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
    };

    moviesService = new MoviesService(repositoryMock as unknown as Repository<Movie>);
  });

  it('findAll returns movies ordered by createdAt desc', async () => {
    const movies = [{ id: '1' }, { id: '2' }] as Movie[];
    repositoryMock.find.mockResolvedValue(movies);

    const result = await moviesService.findAll();

    expect(repositoryMock.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    expect(result).toEqual(movies);
  });

  it('findById throws when movie does not exist', async () => {
    repositoryMock.findOne.mockResolvedValue(null);

    await expect(moviesService.findById('missing-id')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create persists and returns the created movie', async () => {
    const payload = { title: 'A New Hope', releaseYear: 1977, director: 'George Lucas' };
    const createdMovie = { id: 'movie-id', ...payload } as Movie;
    repositoryMock.create.mockReturnValue(createdMovie);
    repositoryMock.save.mockResolvedValue(createdMovie);

    const result = await moviesService.create(payload);

    expect(repositoryMock.create).toHaveBeenCalledWith(payload);
    expect(repositoryMock.save).toHaveBeenCalledWith(createdMovie);
    expect(result).toEqual(createdMovie);
  });

  it('update merges payload and saves movie', async () => {
    const current = {
      id: 'movie-id',
      title: 'A New Hope',
      releaseYear: 1977,
      director: 'George Lucas',
    } as Movie;
    const merged = { ...current, director: 'G. Lucas' } as Movie;

    repositoryMock.findOne.mockResolvedValue(current);
    repositoryMock.merge.mockReturnValue(merged);
    repositoryMock.save.mockResolvedValue(merged);

    const result = await moviesService.update('movie-id', { director: 'G. Lucas' });

    expect(repositoryMock.merge).toHaveBeenCalledWith(current, { director: 'G. Lucas' });
    expect(repositoryMock.save).toHaveBeenCalledWith(merged);
    expect(result).toEqual(merged);
  });

  it('remove deletes existing movie and returns deleted true', async () => {
    const current = { id: 'movie-id' } as Movie;
    repositoryMock.findOne.mockResolvedValue(current);
    repositoryMock.remove.mockResolvedValue(current);

    const result = await moviesService.remove('movie-id');

    expect(repositoryMock.remove).toHaveBeenCalledWith(current);
    expect(result).toEqual({ deleted: true });
  });
});
