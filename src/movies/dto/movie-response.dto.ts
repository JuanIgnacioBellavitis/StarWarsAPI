import { ApiProperty } from '@nestjs/swagger';
import { Movie } from '../entities/movie.entity';

export class MovieResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: '1', nullable: true })
  swapiUid: string | null;

  @ApiProperty({ example: 'A New Hope' })
  title: string;

  @ApiProperty({ example: 1977 })
  releaseYear: number;

  @ApiProperty({ example: 'George Lucas' })
  director: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(movie: Movie): MovieResponseDto {
    const dto = new MovieResponseDto();
    dto.id = movie.id;
    dto.swapiUid = movie.swapiUid;
    dto.title = movie.title;
    dto.releaseYear = movie.releaseYear;
    dto.director = movie.director;
    dto.createdAt = movie.createdAt;
    dto.updatedAt = movie.updatedAt;
    return dto;
  }
}
