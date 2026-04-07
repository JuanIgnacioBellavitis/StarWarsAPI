import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MovieResponseDto } from './dto/movie-response.dto';
import { Movie } from './entities/movie.entity';
import { MoviesService } from './movies.service';

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

  it('findAll returns movies ordered by createdAt desc mapped to DTOs', async () => {
    const movies = [
      { id: '1', swapiUid: null, title: 'A New Hope', releaseYear: 1977, director: 'George Lucas', openingCrawl: null, producer: null, episodeId: null, characters: [], planets: [], species: [], starships: [], vehicles: [], createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01') },
      { id: '2', swapiUid: null, title: 'The Empire Strikes Back', releaseYear: 1980, director: 'Irvin Kershner', openingCrawl: null, producer: null, episodeId: null, characters: [], planets: [], species: [], starships: [], vehicles: [], createdAt: new Date('2026-01-02'), updatedAt: new Date('2026-01-02') },
    ] as Movie[];
    repositoryMock.find.mockResolvedValue(movies);

    const result = await moviesService.findAll();

    expect(repositoryMock.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      relations: ['characters', 'planets', 'species', 'starships', 'vehicles'],
      relationLoadStrategy: 'query',
    });
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(MovieResponseDto);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it('findById throws when movie does not exist', async () => {
    repositoryMock.findOne.mockResolvedValue(null);

    await expect(moviesService.findById('missing-id')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findById searches by swapiUid when identifier is not a UUID', async () => {
    const movie = {
      id: 'movie-id',
      swapiUid: '1',
      title: 'A New Hope',
      releaseYear: 1977,
      director: 'George Lucas',
      openingCrawl: 'It is a period of civil war...',
      producer: 'Gary Kurtz',
      episodeId: 4,
      characters: [{ swapiUid: '1', name: 'Luke Skywalker' }],
      planets: [{ swapiUid: '1', name: 'Tatooine' }],
      species: [{ swapiUid: '1', name: 'Human' }],
      starships: [{ swapiUid: '2', name: 'CR90 corvette' }],
      vehicles: [{ swapiUid: '4', name: 'Sand Crawler' }],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    } as Movie;
    repositoryMock.findOne.mockResolvedValue(movie);

    const result = await moviesService.findById('1');

    expect(repositoryMock.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { swapiUid: '1' } }),
    );
    expect(result).toBeInstanceOf(MovieResponseDto);
    expect(result.swapiUid).toBe('1');
  });

  it('findById searches by id when identifier is a UUID', async () => {
    const uuid = 'a1b2c3d4-e5f6-1890-abcd-ef1234567890';
    const movie = {
      id: uuid,
      swapiUid: null,
      title: 'A New Hope',
      releaseYear: 1977,
      director: 'George Lucas',
      openingCrawl: null,
      producer: null,
      episodeId: null,
      characters: [],
      planets: [],
      species: [],
      starships: [],
      vehicles: [],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    } as Movie;
    repositoryMock.findOne.mockResolvedValue(movie);

    const result = await moviesService.findById(uuid);

    expect(repositoryMock.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: uuid } }),
    );
    expect(result).toBeInstanceOf(MovieResponseDto);
    expect(result.id).toBe(uuid);
  });

  it('create persists and returns a MovieResponseDto', async () => {
    const payload = { title: 'A New Hope', releaseYear: 1977, director: 'George Lucas' };
    const savedMovie = { id: 'movie-id', swapiUid: null, openingCrawl: null, producer: null, episodeId: null, characters: [], planets: [], species: [], starships: [], vehicles: [], ...payload, createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01') } as Movie;
    repositoryMock.create.mockReturnValue(savedMovie);
    repositoryMock.save.mockResolvedValue(savedMovie);

    const result = await moviesService.create(payload);

    expect(repositoryMock.create).toHaveBeenCalledWith(payload);
    expect(repositoryMock.save).toHaveBeenCalledWith(savedMovie);
    expect(result).toBeInstanceOf(MovieResponseDto);
    expect(result.id).toBe('movie-id');
    expect(result.title).toBe('A New Hope');
  });

  it('update merges payload and returns a MovieResponseDto', async () => {
    const current = {
      id: 'movie-id',
      swapiUid: null,
      title: 'A New Hope',
      releaseYear: 1977,
      director: 'George Lucas',
      openingCrawl: null,
      producer: null,
      episodeId: null,
      characters: [],
      planets: [],
      species: [],
      starships: [],
      vehicles: [],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    } as Movie;
    const merged = { ...current, director: 'G. Lucas' } as Movie;

    repositoryMock.findOne.mockResolvedValue(current);
    repositoryMock.merge.mockReturnValue(merged);
    repositoryMock.save.mockResolvedValue(merged);

    const result = await moviesService.update('movie-id', { director: 'G. Lucas' });

    expect(repositoryMock.merge).toHaveBeenCalledWith(current, { director: 'G. Lucas' });
    expect(repositoryMock.save).toHaveBeenCalledWith(merged);
    expect(result).toBeInstanceOf(MovieResponseDto);
    expect(result.director).toBe('G. Lucas');
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
