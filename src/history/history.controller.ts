import { Controller, Get, Post, Body, Query, Delete } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto';
import { ApiResponse } from 'src/common/ApiResponses';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post('create')
  async create(@Body() createHistoryDto: CreateHistoryDto) {
    try {
      const response = await this.historyService.create(createHistoryDto);
      return ApiResponse.success('Create history successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while creating history',
        error,
      );
    }
  }

  @Get('get-history')
  async findAll(
    @Query('clientPhone') clientPhone: string,
    @Query('chatbotNumber') chatbotNumber: string,
  ) {
    try {
      const response = await this.historyService.findAll(
        clientPhone,
        chatbotNumber,
      );
      return ApiResponse.success('Get history successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while geting history', error);
    }
  }

  @Get('parse-history')
  async parseHistory(@Body() arrayHistory: any[]) {
    try {
      const response = await this.historyService.parseHistory(arrayHistory);
      return ApiResponse.success('Parse history successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while parsing history', error);
    }
  }

  @Delete('delete-history')
  async deleteHistory() {
    try {
      const response = await this.historyService.removeAll();
      return ApiResponse.success('Delete history successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while deleting history',
        error,
      );
    }
  }
}
