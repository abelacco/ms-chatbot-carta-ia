import { PartialType } from '@nestjs/mapped-types';
import { CreateCtxDto } from './create-message.dto';

export class UpdateCtxDto extends PartialType(CreateCtxDto) {}
