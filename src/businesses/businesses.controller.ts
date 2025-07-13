import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import {
  GetCurrentUser,
  GetCurrentUserId,
} from '../auth/decorators/get-current-user.decorator';

@ApiTags('businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.SERVICE_PROVIDER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new business' })
  create(
    @Body() createBusinessDto: CreateBusinessDto,
    @GetCurrentUserId() userId: string,
  ) {
    // Service providers can only create businesses for themselves
    if (createBusinessDto.user_id !== userId) {
      createBusinessDto.user_id = userId;
    }
    return this.businessesService.create(createBusinessDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all businesses' })
  findAll() {
    return this.businessesService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get business by user ID' })
  findByUserId(@Param('userId') userId: string) {
    return this.businessesService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business by ID' })
  findOne(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.SERVICE_PROVIDER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a business' })
  async update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') role: Role,
  ) {
    // Check if business belongs to this user before updating
    if (role !== Role.ADMIN) {
      const business = await this.businessesService.findOne(id);
      if (business && business['user_id'] !== userId) {
        throw new Error('Unauthorized: You can only update your own business');
      }
    }
    return this.businessesService.update(id, updateBusinessDto);
  }

  @Delete(':id')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a business' })
  remove(@Param('id') id: string) {
    return this.businessesService.remove(id);
  }
}
