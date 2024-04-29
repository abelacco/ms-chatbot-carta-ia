import { PartialType } from '@nestjs/mapped-types';
import { CreateGeneralServiceDto } from './create-general-service.dto';

export class UpdateGeneralServiceDto extends PartialType(CreateGeneralServiceDto) {}
