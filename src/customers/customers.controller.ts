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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AtGuard } from 'src/auth/guards/at.guard';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(AtGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @GetCurrentUser() currentUser: User,
  ) {
    return this.customersService.create(currentUser.id, createCustomerDto);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user customer profile' })
  @ApiResponse({
    status: 200,
    description: 'Customer profile updated successfully',
  })
  async updateProfile(
    @Body() updateCustomerDto: UpdateCustomerDto,
    @GetCurrentUser() currentUser: User,
  ) {
    return await this.customersService.updateByUserId(
      currentUser.id,
      updateCustomerDto,
    );
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user customer profile' })
  async getProfile(@GetCurrentUser() currentUser: User) {
    return await this.customersService.findByUserId(currentUser.id);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.customersService.findByUserId(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
