import { PartialType } from '@nestjs/mapped-types';
import { CreateCtxDto } from 'src/bot/dto';
// import { CreateCtxDto } from './create-ctx.dto';

export class UpdateCtxDto extends PartialType(CreateCtxDto) {
}
