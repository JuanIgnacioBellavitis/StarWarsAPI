import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';

type SwapiListResponse = {
  result?: Array<{
    uid?: string;
    url?: string;
    properties?: {
      title?: string;
      release_date?: string;
      director?: string;
    };
  }>;
};

type SwapiDetailResponse = {
  result?: {
    uid?: string;
    properties?: {
      title?: string;
      release_date?: string;
      director?: string;
    };
  };
};

@Injectable()
export class SwapiSyncService {
  private readonly logger = new Logger(SwapiSyncService.name);
  private readonly baseUrl = 'https://www.swapi.tech/api/films';

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  async syncMovies(): Promise<{ imported: number; updated: number; skipped: number }> {
    const listResponse = await firstValueFrom(
      this.httpService.get<SwapiListResponse>(this.baseUrl),
    );
    const items = listResponse.data.result ?? [];

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of items) {
      const detail = await this.resolveFilmDetail(item);
      if (!detail.uid || !detail.title || !detail.director || !detail.releaseYear) {
        skipped += 1;
        continue;
      }

      const existing = await this.moviesRepository.findOne({
        where: { swapiUid: detail.uid },
      });

      if (!existing) {
        const created = this.moviesRepository.create({
          swapiUid: detail.uid,
          title: detail.title,
          director: detail.director,
          releaseYear: detail.releaseYear,
        });
        await this.moviesRepository.save(created);
        imported += 1;
        continue;
      }

      const changed =
        existing.title !== detail.title ||
        existing.director !== detail.director ||
        existing.releaseYear !== detail.releaseYear;

      if (!changed) {
        skipped += 1;
        continue;
      }

      existing.title = detail.title;
      existing.director = detail.director;
      existing.releaseYear = detail.releaseYear;
      await this.moviesRepository.save(existing);
      updated += 1;
    }

    this.logger.log(`SWAPI sync completed. Imported=${imported}, Updated=${updated}, Skipped=${skipped}`);
    return { imported, updated, skipped };
  }

  private async resolveFilmDetail(item: {
    uid?: string;
    url?: string;
    properties?: {
      title?: string;
      release_date?: string;
      director?: string;
    };
  }): Promise<{ uid?: string; title?: string; director?: string; releaseYear?: number }> {
    if (item.properties) {
      return {
        uid: item.uid,
        title: item.properties.title,
        director: item.properties.director,
        releaseYear: this.extractReleaseYear(item.properties.release_date),
      };
    }

    if (!item.url) {
      return { uid: item.uid };
    }

    const detailResponse = await firstValueFrom(
      this.httpService.get<SwapiDetailResponse>(item.url),
    );
    const detail = detailResponse.data.result;

    return {
      uid: detail?.uid ?? item.uid,
      title: detail?.properties?.title,
      director: detail?.properties?.director,
      releaseYear: this.extractReleaseYear(detail?.properties?.release_date),
    };
  }

  private extractReleaseYear(releaseDate?: string): number | undefined {
    if (!releaseDate) {
      return undefined;
    }

    const releaseYear = new Date(releaseDate).getUTCFullYear();
    if (Number.isNaN(releaseYear)) {
      return undefined;
    }

    return releaseYear;
  }
}
