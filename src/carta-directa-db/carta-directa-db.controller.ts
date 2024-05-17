import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CartaDirectaDbService } from './carta-directa-db.service';
import { CreateCartaDirectaDbDto } from './dto/create-carta-directa-db.dto';
import { UpdateCartaDirectaDbDto } from './dto/update-carta-directa-db.dto';

@Controller('carta-directa-db')
export class CartaDirectaDbController {
  constructor(private readonly cartaDirectaDbService: CartaDirectaDbService) {}

  @Post()
  create(@Body() createCartaDirectaDbDto: CreateCartaDirectaDbDto) {
    return this.cartaDirectaDbService.create();
  }

  @Get('find-all-companies')
  findAllCompanies() {
    return this.cartaDirectaDbService.findAllCompanies();
  }

  @Get('find-company-coverage/:id')
  findCompanyCoverage(@Param('id') id: number) {
    return this.cartaDirectaDbService.findCompanyCoverage(id);
  }

  @Get('find-company-opening-hours/:id')
  findCompanyOpeningHours(@Param('id') id: number) {
    return this.cartaDirectaDbService.findCompanyOpeningHours(id);
  }

  @Get('find-user/:id')
  findUser(@Param('id') id: number) {
    return this.cartaDirectaDbService.findUser(id);
  }

  @Get('find-one-company/:id')
  findOne(@Param('id') id: number) {
    return this.cartaDirectaDbService.findOneCompany(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCartaDirectaDbDto: UpdateCartaDirectaDbDto,
  ) {
    return this.cartaDirectaDbService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartaDirectaDbService.remove(+id);
  }
}
