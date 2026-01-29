import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ChantiersService } from './chantiers.service';
import { CreateChantierDto } from './dto/create-chantier.dto';
import { UpdateChantierDto } from './dto/update-chantier.dto';
import { FilterChantiersDto } from './dto/filter-chantiers.dto';

@Controller('api/chantiers')
export class ChantiersController {
  constructor(private readonly chantiersService: ChantiersService) {}

  @Post()
  create(@Body() dto: CreateChantierDto) {
    return this.chantiersService.create(dto);
  }

  @Get()
  findAll(@Query() filters: FilterChantiersDto) {
    return this.chantiersService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chantiersService.findOne(id);
  }

  @Get(':id/live')
  findLive(@Param('id') id: string) {
    return this.chantiersService.findLive(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChantierDto) {
    return this.chantiersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chantiersService.remove(id);
  }
}
