import { IsOptional, IsString } from 'class-validator';

export class UpdateUserRequestDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name: string;
}
