// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
// } from '@nestjs/common';
// import { ApiTags } from '@nestjs/swagger';
// import { EmailServiceService } from './email-service.service';
// import { CreateEmailServiceDto } from './dto/create-email-service.dto';
// import { UpdateEmailServiceDto } from './dto/update-email-service.dto';

// @ApiTags('email-service')
// @Controller('email-service')
// export class EmailServiceController {
//   constructor(private readonly emailServiceService: EmailServiceService) {}

//   @Post()
//   create(@Body() createEmailServiceDto: CreateEmailServiceDto) {
//     return this.emailServiceService.create(createEmailServiceDto);
//   }

//   @Get()
//   findAll() {
//     return this.emailServiceService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.emailServiceService.findOne(+id);
//   }

//   @Patch(':id')
//   update(
//     @Param('id') id: string,
//     @Body() updateEmailServiceDto: UpdateEmailServiceDto,
//   ) {
//     return this.emailServiceService.update(+id, updateEmailServiceDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.emailServiceService.remove(+id);
//   }
// }
