import { Body, Inject, Injectable, Module } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, getDocs, getFirestore, setDoc, doc } from "firebase/firestore";
import { UpdateUserProfileDto } from './dto/UpdateUserProfileDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { CreateAdDto } from "./dto/CreateAdDto";

@Injectable()

export class FirebaseAuthService {
    private auth;
    private db;

    constructor(@Inject(ConfigService) private readonly config: ConfigService) {
        const firebaseConfig = {
            apiKey: "AIzaSyAn4AIugtBkAvO0EhTEdHKNftWOlp649dQ",
            authDomain: "testing-project-352202.firebaseapp.com",
            databaseURL: "https://testing-project-352202-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "testing-project-352202",
            storageBucket: "testing-project-352202.appspot.com",
            messagingSenderId: "778843663213",
            appId: "1:778843663213:web:a5758637bbac658a890864",
            measurementId: "G-V63CBVHS60"
        };

        const app = initializeApp(firebaseConfig);
        this.auth = getAuth(app);
        this.db = getFirestore(app);
    }

    async getLogin(@Body() loginUserDto : LoginUserDto) {
        const { stsTokenManager: { accessToken, refreshToken, expirationTime }, uid } = 
        await signInWithEmailAndPassword(this.auth, loginUserDto.email, loginUserDto.password)
            .then((userCredential) => {
                return userCredential.user;
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                return { ...errorMessage, ...errorCode };
            });
        return { accessToken, refreshToken, expirationTime, uid }
    }

    async updateUser(@Body() updateUserProfileDto: UpdateUserProfileDto) {
        const displayName = updateUserProfileDto.displayName ? updateUserProfileDto.displayName : null;
        const photoURL = updateUserProfileDto.photoURL ? updateUserProfileDto.photoURL : null;
        
        const data = await updateProfile(this.auth.currentUser, {
            displayName: displayName,
            photoURL: photoURL,
        }).then(() => {
            return { photoURL: this.auth.currentUser.photoURL, displayName: this.auth.currentUser.displayName }
        }).catch((error) => {
            return error
        });
        return data;
    }

    async createAd(@Body() createAdDto : CreateAdDto) {

        const ads_name = createAdDto.ads_name;
        const ads_remarks = createAdDto.ads_remarks;
        const ads_type = createAdDto.ads_type;
        const created_user_uuid = this.auth.currentUser ? this.auth.currentUser.uid : "xxx";
        const expiry_date = createAdDto.expiry_date;
        const link_url = createAdDto.link_url;
        const priority = createAdDto.priority;
        const start_date = createAdDto.start_date;
        const supplier_uuid = createAdDto.supplier_uuid;
        const unit_price = createAdDto.unit_price;
        const uuid = createAdDto.uuid;

        // Nested collection 
        const banners = createAdDto.banners;
        const ads_tags = createAdDto.ads_tags;
        const limiting_conditions = createAdDto.limiting_conditions;
        const show_conditions = createAdDto.show_conditions;

        const banners_collection = 
            await setDoc(doc(this.db, "advertisement", uuid, "banners", uuid), {
                uuid: banners['uuid'] ? banners['uuid'] : null,
                firestore_path: banners['firestore_path'] ? banners['firestore_path'] : null,
                banner_group: banners['banner_group'] ? banners['banner_group'] : null,
                order: banners['order'] ? banners['order'] : null
            }).then(() => {                
                return { uuid: banners['uuid'], firestore_path: banners['firestore_path'], 
                banner_group: banners['banner_group'], order: banners['order'] }
            })

        const ads_tags_collection = doc(this.db, "advertisement", uuid, "ads_tag", uuid);
            await setDoc(ads_tags_collection, {
                tag_uuid: ads_tags['tag_uuid'] ? ads_tags['tag_uuid'] : null
            }).then(() => {
                return { tag_uuid: ads_tags['tag_uuid'] }
            })

        const limiting_conditions_collection = doc(this.db, "advertisement", uuid, "limiting_conditions", uuid)
            await setDoc(limiting_conditions_collection, {
                uuid: limiting_conditions['uuid'] ? limiting_conditions['uuid'] : null,
                tag_uuid: limiting_conditions['tag_uuid'] ? limiting_conditions['tag_uuid'] : null,
                minimun: limiting_conditions['minimun'] ? limiting_conditions['minimun'] : null,
                maximun: limiting_conditions['maximun'] ? limiting_conditions['maximun'] : null
            }).then(() => {
                return {
                    uuid: limiting_conditions['uuid'],
                    tag_uuid: limiting_conditions['tag_uuid'],
                    minimun: limiting_conditions['minimun'],
                    maximun: limiting_conditions['maximun']
                }
            })
        
        const show_conditions_collection = doc(this.db, "advertisement", uuid , "show_conditions", uuid);
            await setDoc(show_conditions_collection, {
                uuid: show_conditions['uuid'] ? show_conditions['uuid'] : null,
                date_of_week_to_show: show_conditions['date_of_week_to_show'] ? show_conditions['date_of_week_to_show'] : null,
                range_of_hours_to_show: show_conditions['range_of_hours_to_show'] ? show_conditions['range_of_hours_to_show'] : null
            }).then(() => {
                return {
                    uuid: show_conditions['uuid'],
                    date_of_week_to_show: show_conditions['date_of_week_to_show'],
                    range_of_hours_to_show: show_conditions['range_of_hours_to_show']
                }
            })

        const ads = await setDoc(doc(this.db, "advertisement", uuid), {
            ads_name: ads_name,
            ads_remarks: ads_remarks,
            ads_type: ads_type,
            created_user_uuid: created_user_uuid,
            expiry_date: expiry_date,
            link_url: link_url,
            priority: priority,
            start_date: start_date,
            supplier_uuid: supplier_uuid,
            unit_price: unit_price,
            uuid: uuid,  
            banners: banners_collection,
            limiting_conditions: limiting_conditions_collection,
            show_conditions: show_conditions_collection,
        })
        .then(() => {
            return {
                uuid, unit_price, supplier_uuid, start_date, priority,
                link_url, expiry_date, created_user_uuid, ads_type, ads_remarks, 
                ads_name, banners, limiting_conditions, show_conditions
            }
        });
        return ads
    }
}