import { IsString, IsNumber, IsDateString , IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


export class UpdateAdDto {

    @IsString()
    ads_name: string;

    @IsString()
    ads_remarks: string;

    @IsString()
    ads_type: string;

    @IsDateString()
    expiry_date: string;

    @IsString()
    link_url: string;
    
    @IsNumber()
    priority: number;
    
    @IsDateString()
    start_date: string;
    
    @IsString()
    supplier_uuid: string;

    @IsString()
    unit_price:string;
    
    @IsString()
    uuid: string;

    @ValidateNested()
    @IsObject()
    ads_tags: object;

    @ValidateNested()
    @IsObject()
    banners: object;

    @ValidateNested()
    @IsObject()
    limiting_conditions: object;

    @ValidateNested()
    @IsObject()
    show_conditions: object;
}