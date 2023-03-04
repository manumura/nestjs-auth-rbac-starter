import { IsEnum, IsNumberString, IsOptional, IsBooleanString } from 'class-validator';

import { Role } from '../model/role.model';
import { ApiProperty } from '@nestjs/swagger';

export class GetUsersDto {
  @IsOptional()
  @IsEnum(Role)
  @ApiProperty({ enum: Role, required: false })
  role: Role;

  @IsOptional()
  @IsNumberString()
  @ApiProperty({ required: false })
  page: number;

  @IsOptional()
  @IsNumberString()
  @ApiProperty({ required: false })
  pageSize: number;
}
