import { Controller } from '@nestjs/common';
import { BuilderTemplatesService } from './builder-templates.service';

@Controller('builder-templates')
export class BuilderTemplatesController {
  constructor(private readonly builderTemplatesService: BuilderTemplatesService) {}
}
