import { IsString } from 'class-validator';

export class UpdateUserProfileDto {
    @IsString()
    displayName: string;

    @IsString()
    photoURL: string;
}

