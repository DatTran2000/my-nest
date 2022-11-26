import { IsString, IsNumber, IsDateString , IsObject, ValidateNested } from 'class-validator';

export class CreateAdDto {
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

    @IsObject()
    ads_tags: object;

    @IsObject()
    banners: object;

    @IsObject()
    limiting_conditions: object;

    @IsObject()
    show_conditions: object;
}