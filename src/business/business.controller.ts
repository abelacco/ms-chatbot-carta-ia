import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto, LoginBusinessDto, UpdateMetaAccess } from './dto';

@Controller('business')
export default class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('create')
  createBusiness(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.createBusiness(createBusinessDto);
  }

  @Post('login')
  loginBusiness(@Body() loginBusinessDto: LoginBusinessDto) {
    return this.businessService.loginBusiness(loginBusinessDto);
  }

  @Get('get-business/:term')
  getBusiness(@Param('term') term: string) {
    return this.businessService.getBusiness(term);
  }

  @Put('update-meta-access/:id')
  updateMetadata(
    @Param('id') id: string,
    @Body() updateMetaAccess: UpdateMetaAccess,
  ) {
    return this.businessService.updateMetadata(id, updateMetaAccess);
  }
}
