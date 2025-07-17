import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
  Put,
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
  /*GetCurrentUser*/
  GetCurrentUserId,
} from '../auth/decorators/get-current-user.decorator';

@ApiTags('businesses')
@ApiBearerAuth()
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.SERVICE_PROVIDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new business for the current provider' })
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @GetCurrentUserId() userId: string,
  ) {
    // Check if user already has a business
    const existingBusiness = await this.businessesService.findByUserId(userId);
    if (existingBusiness) {
      throw new HttpException(
        'User already has a registered business',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Set the user_id to current user regardless of what's in DTO
    createBusinessDto.user_id = userId;
    return this.businessesService.create(createBusinessDto);
  }

  @Get('my-business')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.SERVICE_PROVIDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current provider's business" })
  async getMyBusiness(@GetCurrentUserId() userId: string) {
    const business = await this.businessesService.findByUserId(userId);
    if (!business) {
      throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
    }
    return business;
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
  @ApiOperation({ summary: 'Get a business by ID' })
  findOne(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.SERVICE_PROVIDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a business by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @GetCurrentUserId() userId: string,
  ) {
    // Ensure business belongs to the user
    const business = await this.businessesService.findOne(id);
    if (!business) {
      throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
    }

    if (business.user_id !== userId) {
      throw new HttpException(
        'You can only update your own business',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.businessesService.update(id, updateBusinessDto);
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Get services by business ID' })
  getBusinessServices(@Param('id') id: string) {
    return this.businessesService.getBusinessServices(id);
  }

  @Patch(':id')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.SERVICE_PROVIDER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a business' })
  @Delete(':id')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a business' })
  remove(@Param('id') id: string) {
    return this.businessesService.remove(id);
  }
}
