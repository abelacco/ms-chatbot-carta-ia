import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CartaDirectaDbService } from './carta-directa-db.service';
import { CoverageFromXlsxToDbDto } from '../dto';
import { ApiResponse } from 'src/common/ApiResponses';

@Controller('carta-directa-db')
export class CartaDirectaDbController {
  constructor(private readonly cartaDirectaDbService: CartaDirectaDbService) {}

  @Get('find-all-companies')
  async findAllCompanies() {
    try {
      const response = await this.cartaDirectaDbService.findAllCompanies();
      return ApiResponse.success('Finded all companies successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while finding all companies',
        error,
      );
    }
  }

  @Get('find-company-coverage/:id')
  async findCompanyCoverage(@Param('id') id: number) {
    try {
      const response = await this.cartaDirectaDbService.findCompanyCoverage(id);
      return ApiResponse.success(
        'Finded company coverage successfully',
        response,
      );
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while finding company coverage',
        error,
      );
    }
  }

  @Get('find-company-opening-hours/:id')
  async findCompanyOpeningHours(@Param('id') id: number) {
    try {
      const response = await this.cartaDirectaDbService.findCompanyOpeningHours(
        id,
      );
      return ApiResponse.success(
        'Finded company opening hours successfully',
        response,
      );
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while finding company opening hours',
        error,
      );
    }
  }

  @Get('find-user/:id')
  async findUser(@Param('id') id: number) {
    try {
      const response = await this.cartaDirectaDbService.findUser(id);
      return ApiResponse.success('Finded user successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while finding user', error);
    }
  }

  @Get('find-one-company/:id')
  async findOne(@Param('id') id: number) {
    try {
      const response = await this.cartaDirectaDbService.findOneCompany(id);
      return ApiResponse.success('Finded company successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while finding company', error);
    }
  }

  @Post('coverage-from-xlsx-to-db')
  async coverageFromXlsxToDb(@Body() body: CoverageFromXlsxToDbDto) {
    try {
      const response = await this.cartaDirectaDbService.coverageFromXlsxToDb(
        body,
      );
      return ApiResponse.success(
        'Migrated coverage from xlsx to db successfully',
        response,
      );
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while migrating coverage from xlsx to db',
        error,
      );
    }
  }

  @Post('menu-from-xlsx-to-db/:id')
  async menuFromXlsxToDb(@Param('id') id: number) {
    try {
      const response = await this.cartaDirectaDbService.menuFromXlsxToDb(id);
      return ApiResponse.success(
        'Migrated menu from xlsx to db successfully',
        response,
      );
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while migrating menu from xlsx to db',
        error,
      );
    }
  }

  @Post('webhook-carta-directa')
  async webhookCartaDirecta(@Body() body: any) {
    try {
      const response = await this.cartaDirectaDbService.webhookCartaDirecta(
        body,
      );
      return ApiResponse.success(
        'Webhook carta directa successfully',
        response,
      );
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while webhook carta directa',
        error,
      );
    }

  }
}
