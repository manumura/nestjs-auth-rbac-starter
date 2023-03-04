import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  public password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  public name: string;
}
