import { ApiProperty } from '@nestjs/swagger';
import { Movie } from '../entities/movie.entity';

export class MovieResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: '1', nullable: true })
  swapiUid: string | null;

  @ApiProperty({ example: 4, nullable: true })
  episodeId: number | null;

  @ApiProperty({ example: 'A New Hope' })
  title: string;

  @ApiProperty({ example: 1977 })
  releaseYear: number;

  @ApiProperty({ example: 'George Lucas' })
  director: string;

  @ApiProperty({ example: 'Gary Kurtz, Rick McCallum', nullable: true })
  producer: string | null;

  @ApiProperty({ example: 'It is a period of civil war...', nullable: true })
  openingCrawl: string | null;

  @ApiProperty({ example: ['Luke Skywalker', 'C-3PO'], nullable: true })
  characters: string[] | null;

  @ApiProperty({ example: ['Tatooine', 'Alderaan'], nullable: true })
  planets: string[] | null;

  @ApiProperty({ example: ['Human', 'Droid'], nullable: true })
  species: string[] | null;

  @ApiProperty({ example: ['CR90 corvette', 'Death Star'], nullable: true })
  starships: string[] | null;

  @ApiProperty({ example: ['Sand Crawler', 'T-16 skyhopper'], nullable: true })
  vehicles: string[] | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(movie: Movie): MovieResponseDto {
    const dto = new MovieResponseDto();
    dto.id = movie.id;
    dto.swapiUid = movie.swapiUid;
    dto.episodeId = movie.episodeId ?? null;
    dto.title = movie.title;
    dto.releaseYear = movie.releaseYear;
    dto.director = movie.director;
    dto.producer = movie.producer ?? null;
    dto.openingCrawl = movie.openingCrawl ?? null;
    dto.characters = movie.characters?.map((p) => p.name) ?? null;
    dto.planets = movie.planets?.map((p) => p.name) ?? null;
    dto.species = movie.species?.map((s) => s.name) ?? null;
    dto.starships = movie.starships?.map((s) => s.name) ?? null;
    dto.vehicles = movie.vehicles?.map((v) => v.name) ?? null;
    dto.createdAt = movie.createdAt;
    dto.updatedAt = movie.updatedAt;
    return dto;
  }
}
