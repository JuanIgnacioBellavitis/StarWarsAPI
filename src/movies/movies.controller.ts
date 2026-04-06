import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoviesService } from './movies.service';

@ApiTags('Movies')
@ApiBearerAuth()
@Controller('movies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.REGULAR)
  @ApiOperation({ summary: 'Get movie list' })
  @ApiOkResponse({ description: 'Movies retrieved successfully' })
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.REGULAR)
  @ApiOperation({ summary: 'Get a movie detail' })
  @ApiOkResponse({ description: 'Movie retrieved successfully' })
  findById(@Param('id') id: string) {
    return this.moviesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new movie (admin only)' })
  @ApiOkResponse({ description: 'Movie created successfully' })
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a movie (admin only)' })
  @ApiOkResponse({ description: 'Movie updated successfully' })
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a movie (admin only)' })
  @ApiOkResponse({ description: 'Movie deleted successfully' })
  remove(@Param('id') id: string) {
    return this.moviesService.remove(id);
  }
}
