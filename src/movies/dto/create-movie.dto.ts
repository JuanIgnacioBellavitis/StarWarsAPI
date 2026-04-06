import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: 'A New Hope' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: 1977 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  releaseYear: number;

  @ApiProperty({ example: 'George Lucas' })
  @IsString()
  @MinLength(1)
  director: string;
}
