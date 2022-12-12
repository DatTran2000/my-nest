import { IsString, IsNumber, IsDateString , IsObject, ValidateNested, IsNotEmpty } from 'class-validator';


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
    @IsNotEmpty()
    ads_tags: any;

    @ValidateNested()
    @IsNotEmpty()
    banners: any;

    @ValidateNested()
    @IsNotEmpty()
    limiting_conditions: any;

    @ValidateNested()
    @IsNotEmpty()
    show_conditions: any;
}