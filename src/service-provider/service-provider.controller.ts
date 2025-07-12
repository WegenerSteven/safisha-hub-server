import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ServiceProviderService } from './service-provider.service';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { UpdateServiceProviderDto } from './dto/update-service-provider.dto';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AtGuard } from 'src/auth/guards/at.guard';
import { Public } from 'src/auth/decorators/public.decorators';

@ApiTags('service-providers')
@ApiBearerAuth()
@UseGuards(AtGuard)
@Controller('service-provider')
export class ServiceProviderController {
  constructor(
    private readonly serviceProviderService: ServiceProviderService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create service provider profile' })
  async create(
    @Body() createServiceProviderDto: CreateServiceProviderDto,
    @GetCurrentUser() currentUser: User,
  ) {
    return await this.serviceProviderService.create(
      currentUser.id,
      createServiceProviderDto,
    );
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user service provider profile' })
  @ApiResponse({
    status: 200,
    description: 'Service provider profile updated successfully',
  })
  async updateProfile(
    @Body() updateServiceProviderDto: UpdateServiceProviderDto,
    @GetCurrentUser() currentUser: User,
  ) {
    console.log('Update profile called for user:', currentUser.id);
    console.log('Data received:', updateServiceProviderDto);

    return await this.serviceProviderService.updateByUserId(
      currentUser.id,
      updateServiceProviderDto,
    );
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user service provider profile' })
  async getProfile(@GetCurrentUser() currentUser: User) {
    return await this.serviceProviderService.findByUserId(currentUser.id);
  }

  @Get()
  @Public()
  findAll() {
    return this.serviceProviderService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.serviceProviderService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceProviderDto: UpdateServiceProviderDto,
  ) {
    return this.serviceProviderService.update(id, updateServiceProviderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceProviderService.remove(id);
  }
}
