import { IsEmail, IsPositive, IsString } from 'class-validator';

export class CreateUserEntityDto {
  @IsEmail()
  public email?: string;

  @IsString()
  public password?: string;

  @IsString()
  public name?: string;

  @IsPositive()
  public roleId?: number;
}
