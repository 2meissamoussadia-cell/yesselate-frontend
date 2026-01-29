import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ClientSegment } from '@prisma/client';

export class CreateChantierDto {
  @IsString()
  clientId: string;

  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  margePct?: number;

  @IsEnum(ClientSegment)
  segment: ClientSegment;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  phase?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(26)
  etape?: number;

  @IsOptional()
  @IsNumber()
  gpsLat?: number;

  @IsOptional()
  @IsNumber()
  gpsLng?: number;

  @IsOptional()
  dateDebut?: string;

  @IsOptional()
  dateFinPrevue?: string;
}
