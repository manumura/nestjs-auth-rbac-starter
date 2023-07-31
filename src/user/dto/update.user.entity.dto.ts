import { IsBoolean, IsEmail, IsPositive, IsString } from 'class-validator';

export class UpdateUserEntityDto {
  @IsEmail()
  email?: string;

  @IsString()
  password?: string;

  @IsString()
  name?: string;

  @IsBoolean()
  isActive?: boolean;

  @IsPositive()
  roleId?: number;

  @IsString()
  imageId?: string;

  @IsString()
  imageUrl?: string;
}
