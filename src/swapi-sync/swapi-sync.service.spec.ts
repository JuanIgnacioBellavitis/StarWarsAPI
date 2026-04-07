import { Repository } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { Person } from './entities/person.entity';
import { Planet } from './entities/planet.entity';
import { Species } from './entities/species.entity';
import { Starship } from './entities/starship.entity';
import { Vehicle } from './entities/vehicle.entity';
import { SwapiClient } from './swapi-client.service';
import { SwapiSyncService } from './swapi-sync.service';

const makeRepoMock = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('SwapiSyncService', () => {
  let swapiSyncService: SwapiSyncService;
  let swapiClientMock: {
    fetchFilms: jest.Mock;
    fetchFilmDetail: jest.Mock;
    fetchAllPages: jest.Mock;
    extractUidFromUrl: jest.Mock;
  };
  let moviesRepoMock: ReturnType<typeof makeRepoMock>;
  let peopleRepoMock: ReturnType<typeof makeRepoMock>;
  let planetsRepoMock: ReturnType<typeof makeRepoMock>;
  let speciesRepoMock: ReturnType<typeof makeRepoMock>;
  let starshipsRepoMock: ReturnType<typeof makeRepoMock>;
  let vehiclesRepoMock: ReturnType<typeof makeRepoMock>;

  const filmItem = {
    uid: '1',
    properties: {
      title: 'A New Hope',
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      release_date: '1977-05-25',
      opening_crawl: 'It is a period of civil war...',
      episode_id: 4,
      characters: ['https://www.swapi.tech/api/people/1'],
      planets: ['https://www.swapi.tech/api/planets/1'],
      species: ['https://www.swapi.tech/api/species/1'],
      starships: ['https://www.swapi.tech/api/starships/2'],
      vehicles: ['https://www.swapi.tech/api/vehicles/4'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    swapiClientMock = {
      fetchFilms: jest.fn(),
      fetchFilmDetail: jest.fn(),
      fetchAllPages: jest.fn().mockResolvedValue([]),
      extractUidFromUrl: jest.fn((url: string) => url.split('/').filter(Boolean).pop()),
    };

    moviesRepoMock = makeRepoMock();
    peopleRepoMock = makeRepoMock();
    planetsRepoMock = makeRepoMock();
    speciesRepoMock = makeRepoMock();
    starshipsRepoMock = makeRepoMock();
    vehiclesRepoMock = makeRepoMock();

    swapiSyncService = new SwapiSyncService(
      swapiClientMock as unknown as SwapiClient,
      moviesRepoMock as unknown as Repository<Movie>,
      peopleRepoMock as unknown as Repository<Person>,
      planetsRepoMock as unknown as Repository<Planet>,
      speciesRepoMock as unknown as Repository<Species>,
      starshipsRepoMock as unknown as Repository<Starship>,
      vehiclesRepoMock as unknown as Repository<Vehicle>,
    );
  });

  it('imports a new movie with related entities when uid does not exist', async () => {
    swapiClientMock.fetchFilms.mockResolvedValue([filmItem]);
    moviesRepoMock.findOne.mockResolvedValue(null);
    peopleRepoMock.findOne.mockResolvedValue({ swapiUid: '1', name: 'Luke Skywalker' });
    planetsRepoMock.findOne.mockResolvedValue({ swapiUid: '1', name: 'Tatooine' });
    speciesRepoMock.findOne.mockResolvedValue({ swapiUid: '1', name: 'Human' });
    starshipsRepoMock.findOne.mockResolvedValue({ swapiUid: '2', name: 'CR90 corvette' });
    vehiclesRepoMock.findOne.mockResolvedValue({ swapiUid: '4', name: 'Sand Crawler' });
    moviesRepoMock.create.mockImplementation((data: unknown) => data);
    moviesRepoMock.save.mockResolvedValue(undefined);

    const result = await swapiSyncService.syncMovies();

    expect(moviesRepoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        swapiUid: '1',
        title: 'A New Hope',
        director: 'George Lucas',
        releaseYear: 1977,
        openingCrawl: 'It is a period of civil war...',
        producer: 'Gary Kurtz',
        episodeId: 4,
      }),
    );
    expect(result).toEqual({ imported: 1, updated: 0, skipped: 0 });
  });

  it('updates an existing movie when SWAPI data changed', async () => {
    swapiClientMock.fetchFilms.mockResolvedValue([filmItem]);
    const existing = {
      swapiUid: '1',
      title: 'Old Title',
      director: 'Old Director',
      releaseYear: 1970,
      openingCrawl: null,
      producer: null,
      episodeId: null,
    } as Movie;
    moviesRepoMock.findOne.mockResolvedValue(existing);
    peopleRepoMock.findOne.mockResolvedValue(null);
    planetsRepoMock.findOne.mockResolvedValue(null);
    speciesRepoMock.findOne.mockResolvedValue(null);
    starshipsRepoMock.findOne.mockResolvedValue(null);
    vehiclesRepoMock.findOne.mockResolvedValue(null);
    moviesRepoMock.save.mockResolvedValue(undefined);

    const result = await swapiSyncService.syncMovies();

    expect(existing.title).toBe('A New Hope');
    expect(existing.director).toBe('George Lucas');
    expect(existing.releaseYear).toBe(1977);
    expect(result).toEqual({ imported: 0, updated: 1, skipped: 0 });
  });

  it('skips an existing movie when SWAPI data is unchanged', async () => {
    swapiClientMock.fetchFilms.mockResolvedValue([filmItem]);
    const existing = {
      swapiUid: '1',
      title: 'A New Hope',
      director: 'George Lucas',
      releaseYear: 1977,
      openingCrawl: 'It is a period of civil war...',
      producer: 'Gary Kurtz',
      episodeId: 4,
    } as Movie;
    moviesRepoMock.findOne.mockResolvedValue(existing);
    peopleRepoMock.findOne.mockResolvedValue(null);
    planetsRepoMock.findOne.mockResolvedValue(null);
    speciesRepoMock.findOne.mockResolvedValue(null);
    starshipsRepoMock.findOne.mockResolvedValue(null);
    vehiclesRepoMock.findOne.mockResolvedValue(null);

    const result = await swapiSyncService.syncMovies();

    expect(moviesRepoMock.save).not.toHaveBeenCalled();
    expect(result).toEqual({ imported: 0, updated: 0, skipped: 1 });
  });

  it('skips film items with missing required fields', async () => {
    swapiClientMock.fetchFilms.mockResolvedValue([{ uid: '99', properties: { title: 'Incomplete' } }]);

    const result = await swapiSyncService.syncMovies();

    expect(result).toEqual({ imported: 0, updated: 0, skipped: 1 });
  });

  it('syncs named entities from each endpoint on every sync call', async () => {
    swapiClientMock.fetchFilms.mockResolvedValue([]);
    swapiClientMock.fetchAllPages.mockResolvedValue([{ uid: '1', name: 'Luke Skywalker', url: 'https://www.swapi.tech/api/people/1' }]);
    peopleRepoMock.findOne.mockResolvedValue(null);
    peopleRepoMock.create.mockImplementation((d: unknown) => d);
    peopleRepoMock.save.mockResolvedValue(undefined);
    planetsRepoMock.findOne.mockResolvedValue({ swapiUid: '1' });
    speciesRepoMock.findOne.mockResolvedValue({ swapiUid: '1' });
    starshipsRepoMock.findOne.mockResolvedValue({ swapiUid: '1' });
    vehiclesRepoMock.findOne.mockResolvedValue({ swapiUid: '1' });

    await swapiSyncService.syncMovies();

    expect(swapiClientMock.fetchAllPages).toHaveBeenCalledWith('people');
    expect(swapiClientMock.fetchAllPages).toHaveBeenCalledWith('planets');
    expect(swapiClientMock.fetchAllPages).toHaveBeenCalledWith('species');
    expect(swapiClientMock.fetchAllPages).toHaveBeenCalledWith('starships');
    expect(swapiClientMock.fetchAllPages).toHaveBeenCalledWith('vehicles');
  });
});
