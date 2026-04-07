import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

export type SwapiNamedResource = {
  uid: string;
  name: string;
  url: string;
};

type SwapiPagedResponse = {
  results?: SwapiNamedResource[];
  next?: string | null;
};

export type SwapiFilmProperties = {
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

type SwapiFilmListItem = {
  uid?: string;
  url?: string;
  properties?: SwapiFilmProperties;
};

type SwapiFilmListResponse = {
  result?: SwapiFilmListItem[];
};

type SwapiFilmDetailResponse = {
  result?: {
    uid?: string;
    properties?: SwapiFilmProperties;
  };
};

@Injectable()
export class SwapiClient {
  private readonly baseUrl = 'https://www.swapi.tech/api';

  constructor(private readonly httpService: HttpService) {}

  async fetchAllPages(endpoint: string): Promise<SwapiNamedResource[]> {
    const all: SwapiNamedResource[] = [];
    let url: string | null = `${this.baseUrl}/${endpoint}`;

    while (url) {
      const response = await firstValueFrom(
        this.httpService.get<SwapiPagedResponse>(url),
      );
      const page = response.data;
      const results = page.results ?? [];
      all.push(...results);
      url = page.next ?? null;
    }

    return all;
  }

  async fetchFilms(): Promise<SwapiFilmListItem[]> {
    const response = await firstValueFrom(
      this.httpService.get<SwapiFilmListResponse>(`${this.baseUrl}/films`),
    );
    return response.data.result ?? [];
  }

  async fetchFilmDetail(url: string): Promise<SwapiFilmDetailResponse['result']> {
    const response = await firstValueFrom(
      this.httpService.get<SwapiFilmDetailResponse>(url),
    );
    return response.data.result;
  }

  extractUidFromUrl(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1];
  }
}
