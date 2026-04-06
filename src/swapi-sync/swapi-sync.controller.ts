import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
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
import { SwapiSyncService } from './swapi-sync.service';

@ApiTags('SWAPI Sync')
@ApiBearerAuth()
@Controller('swapi-sync')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SwapiSyncController {
  constructor(private readonly swapiSyncService: SwapiSyncService) {}

  @Post('movies')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Synchronize movies from SWAPI (admin only)' })
  @ApiOkResponse({ description: 'SWAPI synchronization completed' })
  syncMovies() {
    return this.swapiSyncService.syncMovies();
  }
}
