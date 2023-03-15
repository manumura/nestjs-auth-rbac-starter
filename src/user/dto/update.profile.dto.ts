import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  public password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  public name?: string;
}
