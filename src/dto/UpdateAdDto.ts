import { IsString, IsNumber, IsDateString , IsObject, ValidateNested } from 'class-validator';

export class UpdateAdDto {
    @IsString()
    ads_name: number;
}