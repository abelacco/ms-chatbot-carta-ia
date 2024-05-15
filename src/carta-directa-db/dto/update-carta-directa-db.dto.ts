import { PartialType } from '@nestjs/swagger';
import { CreateCartaDirectaDbDto } from './create-carta-directa-db.dto';

export class UpdateCartaDirectaDbDto extends PartialType(CreateCartaDirectaDbDto) {}
