import { IsBoolean, IsEmail, IsPositive, IsString } from 'class-validator';

export class UpdateUserEntityDto {
  @IsEmail()
  public email?: string;

  @IsString()
  public password?: string;

  @IsString()
  public name?: string;

  @IsBoolean()
  public isActive?: boolean;

  @IsPositive()
  public roleId?: number;

  @IsString()
  public imageId?: string;

  @IsString()
  public imageUrl?: string;
}
