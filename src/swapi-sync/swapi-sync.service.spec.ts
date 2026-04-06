import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { Repository } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { SwapiSyncService } from './swapi-sync.service';

describe('SwapiSyncService', () => {
  let swapiSyncService: SwapiSyncService;
  let httpServiceMock: { get: jest.Mock };
  let repositoryMock: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    httpServiceMock = {
      get: jest.fn(),
    };

    repositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    swapiSyncService = new SwapiSyncService(
      httpServiceMock as unknown as HttpService,
      repositoryMock as unknown as Repository<Movie>,
    );
  });

  it('imports a new movie when swapi uid does not exist', async () => {
    httpServiceMock.get.mockReturnValueOnce(
      of({
        data: {
          result: [
            {
              uid: '1',
              properties: {
                title: 'A New Hope',
                director: 'George Lucas',
                release_date: '1977-05-25',
              },
            },
          ],
        },
      }),
    );
    repositoryMock.findOne.mockResolvedValue(null);
    repositoryMock.create.mockImplementation((data: unknown) => data);
    repositoryMock.save.mockResolvedValue(undefined);

    const result = await swapiSyncService.syncMovies();

    expect(repositoryMock.create).toHaveBeenCalledWith({
      swapiUid: '1',
      title: 'A New Hope',
      director: 'George Lucas',
      releaseYear: 1977,
    });
    expect(result).toEqual({ imported: 1, updated: 0, skipped: 0 });
  });

  it('updates an existing movie when swapi data changed', async () => {
    httpServiceMock.get.mockReturnValueOnce(
      of({
        data: {
          result: [
            {
              uid: '2',
              properties: {
                title: 'The Empire Strikes Back',
                director: 'Irvin Kershner',
                release_date: '1980-05-17',
              },
            },
          ],
        },
      }),
    );
    const existing = {
      id: 'db-id',
      swapiUid: '2',
      title: 'Old title',
      director: 'Old director',
      releaseYear: 1970,
    } as Movie;
    repositoryMock.findOne.mockResolvedValue(existing);
    repositoryMock.save.mockResolvedValue(undefined);

    const result = await swapiSyncService.syncMovies();

    expect(existing.title).toBe('The Empire Strikes Back');
    expect(existing.director).toBe('Irvin Kershner');
    expect(existing.releaseYear).toBe(1980);
    expect(result).toEqual({ imported: 0, updated: 1, skipped: 0 });
  });

  it('skips an existing movie when swapi data is unchanged', async () => {
    httpServiceMock.get.mockReturnValueOnce(
      of({
        data: {
          result: [
            {
              uid: '3',
              properties: {
                title: 'Return of the Jedi',
                director: 'Richard Marquand',
                release_date: '1983-05-25',
              },
            },
          ],
        },
      }),
    );
    repositoryMock.findOne.mockResolvedValue({
      id: 'db-id',
      swapiUid: '3',
      title: 'Return of the Jedi',
      director: 'Richard Marquand',
      releaseYear: 1983,
    } as Movie);

    const result = await swapiSyncService.syncMovies();

    expect(result).toEqual({ imported: 0, updated: 0, skipped: 1 });
  });

  it('skips item when required fields are missing', async () => {
    httpServiceMock.get.mockReturnValueOnce(
      of({
        data: {
          result: [
            {
              uid: '4',
              properties: {
                title: 'Incomplete movie',
                release_date: '1999-01-01',
              },
            },
          ],
        },
      }),
    );

    const result = await swapiSyncService.syncMovies();

    expect(repositoryMock.findOne).not.toHaveBeenCalled();
    expect(result).toEqual({ imported: 0, updated: 0, skipped: 1 });
  });

  it('fetches detail URL when list item has no properties', async () => {
    httpServiceMock.get
      .mockReturnValueOnce(
        of({
          data: {
            result: [{ uid: '5', url: 'https://www.swapi.tech/api/films/5' }],
          },
        }),
      )
      .mockReturnValueOnce(
        of({
          data: {
            result: {
              uid: '5',
              properties: {
                title: 'Attack of the Clones',
                director: 'George Lucas',
                release_date: '2002-05-16',
              },
            },
          },
        }),
      );
    repositoryMock.findOne.mockResolvedValue(null);
    repositoryMock.create.mockImplementation((data: unknown) => data);
    repositoryMock.save.mockResolvedValue(undefined);

    const result = await swapiSyncService.syncMovies();

    expect(httpServiceMock.get).toHaveBeenNthCalledWith(2, 'https://www.swapi.tech/api/films/5');
    expect(result).toEqual({ imported: 1, updated: 0, skipped: 0 });
  });

  it('returns zero counters when swapi list is empty', async () => {
    httpServiceMock.get.mockReturnValueOnce(of({ data: { result: [] } }));

    const result = await swapiSyncService.syncMovies();

    expect(result).toEqual({ imported: 0, updated: 0, skipped: 0 });
  });

  it('skips item when release_date is invalid', async () => {
    httpServiceMock.get.mockReturnValueOnce(
      of({
        data: {
          result: [
            {
              uid: '6',
              properties: {
                title: 'Invalid date movie',
                director: 'Someone',
                release_date: 'invalid-date',
              },
            },
          ],
        },
      }),
    );

    const result = await swapiSyncService.syncMovies();

    expect(result).toEqual({ imported: 0, updated: 0, skipped: 1 });
  });
});
