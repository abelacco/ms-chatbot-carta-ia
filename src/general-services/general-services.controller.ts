import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GeneralServicesService } from './general-services.service';
import { CreateGeneralServiceDto } from './dto/create-general-service.dto';
import { UpdateGeneralServiceDto } from './dto/update-general-service.dto';

@Controller('general-services')
export class GeneralServicesController {
  constructor(private readonly generalServicesService: GeneralServicesService) {}

  @Post()
  create(@Body() createGeneralServiceDto: CreateGeneralServiceDto) {
    return this.generalServicesService.create(createGeneralServiceDto);
  }

  @Get()
  findAll() {
    return this.generalServicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.generalServicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGeneralServiceDto: UpdateGeneralServiceDto) {
    return this.generalServicesService.update(+id, updateGeneralServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.generalServicesService.remove(+id);
  }
}
