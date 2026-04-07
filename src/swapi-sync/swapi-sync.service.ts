import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { Person } from './entities/person.entity';
import { Planet } from './entities/planet.entity';
import { Species } from './entities/species.entity';
import { Starship } from './entities/starship.entity';
import { Vehicle } from './entities/vehicle.entity';
import { SwapiClient, SwapiNamedResource } from './swapi-client.service';

type SyncResult = {
  imported: number;
  updated: number;
  skipped: number;
};

@Injectable()
export class SwapiSyncService {
  private readonly logger = new Logger(SwapiSyncService.name);

  constructor(
    private readonly swapiClient: SwapiClient,
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

  async syncMovies(): Promise<SyncResult> {
    await this.syncAllRelatedEntities();

    const films = await this.swapiClient.fetchFilms();

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of films) {
      const properties = await this.resolveFilmProperties(item);
      if (!properties) {
        skipped += 1;
        continue;
      }

      const { uid, title, director, releaseYear, openingCrawl, producer, episodeId,
        characterUids, planetUids, speciesUids, starshipUids, vehicleUids } = properties;

      const [characters, planets, species, starships, vehicles] = await Promise.all([
        this.findEntitiesByUids(this.peopleRepository, characterUids),
        this.findEntitiesByUids(this.planetsRepository, planetUids),
        this.findEntitiesByUids(this.speciesRepository, speciesUids),
        this.findEntitiesByUids(this.starshipsRepository, starshipUids),
        this.findEntitiesByUids(this.vehiclesRepository, vehicleUids),
      ]);

      const existing = await this.moviesRepository.findOne({ where: { swapiUid: uid } });

      if (!existing) {
        const created = this.moviesRepository.create({
          swapiUid: uid, title, director, releaseYear,
          openingCrawl, producer, episodeId,
          characters, planets, species, starships, vehicles,
        });
        await this.moviesRepository.save(created);
        imported += 1;
        continue;
      }

      const changed =
        existing.title !== title ||
        existing.director !== director ||
        existing.releaseYear !== releaseYear ||
        existing.openingCrawl !== openingCrawl ||
        existing.producer !== producer ||
        existing.episodeId !== episodeId;

      if (!changed) {
        skipped += 1;
        continue;
      }

      Object.assign(existing, {
        title, director, releaseYear, openingCrawl, producer, episodeId,
        characters, planets, species, starships, vehicles,
      });
      await this.moviesRepository.save(existing);
      updated += 1;
    }

    this.logger.log(`SWAPI sync completed. Imported=${imported}, Updated=${updated}, Skipped=${skipped}`);
    return { imported, updated, skipped };
  }

  private async syncAllRelatedEntities(): Promise<void> {
    await Promise.all([
      this.syncNamedEntities('people', this.peopleRepository),
      this.syncNamedEntities('planets', this.planetsRepository),
      this.syncNamedEntities('species', this.speciesRepository),
      this.syncNamedEntities('starships', this.starshipsRepository),
      this.syncNamedEntities('vehicles', this.vehiclesRepository),
    ]);
  }

  private async syncNamedEntities<T extends { swapiUid: string; name: string }>(
    endpoint: string,
    repository: Repository<T>,
  ): Promise<void> {
    const resources = await this.swapiClient.fetchAllPages(endpoint);
    for (const resource of resources) {
      const existing = await repository.findOne({ where: { swapiUid: resource.uid } as never });
      if (!existing) {
        const entity = repository.create({ swapiUid: resource.uid, name: resource.name } as never);
        await repository.save(entity as never);
      }
    }
  }

  private async findEntitiesByUids<T extends { swapiUid: string }>(
    repository: Repository<T>,
    uids: string[],
  ): Promise<T[]> {
    if (!uids.length) return [];
    const entities = await Promise.all(
      uids.map((uid) => repository.findOne({ where: { swapiUid: uid } as never })),
    );
    return entities.filter((e) => e !== null) as T[];
  }

  private async resolveFilmProperties(item: {
    uid?: string;
    url?: string;
    properties?: {
      title?: string;
      director?: string;
      producer?: string;
      release_date?: string;
      opening_crawl?: string;
      episode_id?: number;
      characters?: string[];
      planets?: string[];
      species?: string[];
      starships?: string[];
      vehicles?: string[];
    };
  }): Promise<{
    uid: string;
    title: string;
    director: string;
    releaseYear: number;
    openingCrawl: string | null;
    producer: string | null;
    episodeId: number | null;
    characterUids: string[];
    planetUids: string[];
    speciesUids: string[];
    starshipUids: string[];
    vehicleUids: string[];
  } | null> {
    let props = item.properties;

    if (!props && item.url) {
      const detail = await this.swapiClient.fetchFilmDetail(item.url);
      props = detail?.properties;
    }

    const uid = item.uid;
    const title = props?.title;
    const director = props?.director;
    const releaseYear = this.extractReleaseYear(props?.release_date);

    if (!uid || !title || !director || !releaseYear) return null;

    const extractUids = (urls?: string[]): string[] =>
      (urls ?? []).map((u) => this.swapiClient.extractUidFromUrl(u)).filter(Boolean);

    return {
      uid,
      title,
      director,
      releaseYear,
      openingCrawl: props?.opening_crawl ?? null,
      producer: props?.producer ?? null,
      episodeId: props?.episode_id ?? null,
      characterUids: extractUids(props?.characters),
      planetUids: extractUids(props?.planets),
      speciesUids: extractUids(props?.species),
      starshipUids: extractUids(props?.starships),
      vehicleUids: extractUids(props?.vehicles),
    };
  }

  private extractReleaseYear(releaseDate?: string): number | undefined {
    if (!releaseDate) return undefined;
    const year = new Date(releaseDate).getUTCFullYear();
    return Number.isNaN(year) ? undefined : year;
  }
}
