import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(8)
  public oldPassword: string;

  @IsString()
  @MinLength(8)
  public newPassword: string;
}
