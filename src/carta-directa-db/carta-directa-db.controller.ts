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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartaDirectaDbService.findOne(+id);
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
