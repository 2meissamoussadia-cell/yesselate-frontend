import { IsOptional, IsArray, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ClientSegment, ChantierStatut } from '@prisma/client';

export class FilterChantiersDto {
  @IsOptional()
  @IsArray()
  @IsEnum(ClientSegment, { each: true })
  segment?: ClientSegment[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(6, { each: true })
  @Type(() => Number)
  phase?: number[];

  @IsOptional()
  @IsArray()
  @IsEnum(ChantierStatut, { each: true })
  statut?: ChantierStatut[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  take?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip?: number;
}
