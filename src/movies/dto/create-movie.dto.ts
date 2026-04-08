import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

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

  @ApiPropertyOptional({ example: ['1', '2'], description: 'SWAPI UIDs of characters to associate' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  characterUids?: string[];

  @ApiPropertyOptional({ example: ['1', '2'], description: 'SWAPI UIDs of planets to associate' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  planetUids?: string[];

  @ApiPropertyOptional({ example: ['1', '2'], description: 'SWAPI UIDs of species to associate' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  speciesUids?: string[];

  @ApiPropertyOptional({ example: ['2', '3'], description: 'SWAPI UIDs of starships to associate' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  starshipUids?: string[];

  @ApiPropertyOptional({ example: ['4', '6'], description: 'SWAPI UIDs of vehicles to associate' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vehicleUids?: string[];
}
