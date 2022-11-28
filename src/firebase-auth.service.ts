import { Body, Inject, Injectable, Module, Param } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, getDocs, getFirestore, setDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { UpdateUserProfileDto } from './dto/UpdateUserProfileDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { CreateAdDto } from "./dto/CreateAdDto";
import { UpdateAdDto } from "./dto/UpdateAdDto";

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
        const created_user_uuid = this.auth.currentUser ? this.auth.currentUser.uid : "xxx";    
        
        const banners_collection = doc(this.db, "advertisement", createAdDto.uuid, "banners", createAdDto.uuid);             
            await setDoc(banners_collection, {
                uuid: createAdDto.banners['uuid'] ? createAdDto.banners['uuid'] : null,
                firestore_path: createAdDto.banners['firestore_path'] ? createAdDto.banners['firestore_path'] : null,
                banner_group: createAdDto.banners['banner_group'] ? createAdDto.banners['banner_group'] : null,
                order: createAdDto.banners['order'] ? createAdDto.banners['order'] : null
            }).then(() => {                
                return { uuid: createAdDto.banners['uuid'], firestore_path: createAdDto.banners['firestore_path'], 
                banner_group: createAdDto.banners['banner_group'], order: createAdDto.banners['order'] }
            })

        const ads_tags_collection = doc(this.db, "advertisement", createAdDto.uuid, "ads_tag", createAdDto.uuid);
            await setDoc(ads_tags_collection, {
                tag_uuid: createAdDto.ads_tags['tag_uuid'] ? createAdDto.ads_tags['tag_uuid'] : null
            }).then(() => {
                return { tag_uuid: createAdDto.ads_tags['tag_uuid'] }
            })

        const limiting_conditions_collection = doc(this.db, "advertisement", createAdDto.uuid, "limiting_conditions", createAdDto.uuid)
            await setDoc(limiting_conditions_collection, {
                uuid: createAdDto.limiting_conditions['uuid'] ? createAdDto.limiting_conditions['uuid'] : null,
                tag_uuid: createAdDto.limiting_conditions['tag_uuid'] ? createAdDto.limiting_conditions['tag_uuid'] : null,
                minimun: createAdDto.limiting_conditions['minimun'] ? createAdDto.limiting_conditions['minimun'] : null,
                maximun: createAdDto.limiting_conditions['maximun'] ? createAdDto.limiting_conditions['maximun'] : null
            }).then(() => {
                return {
                    uuid: createAdDto.limiting_conditions['uuid'],
                    tag_uuid: createAdDto.limiting_conditions['tag_uuid'],
                    minimun: createAdDto.limiting_conditions['minimun'],
                    maximun: createAdDto.limiting_conditions['maximun']
                }
            })
        
        const show_conditions_collection = doc(this.db, "advertisement", createAdDto.uuid , "show_conditions", createAdDto.uuid);
            await setDoc(show_conditions_collection, {
                uuid: createAdDto.show_conditions['uuid'] ? createAdDto.show_conditions['uuid'] : null,
                date_of_week_to_show: createAdDto.show_conditions['date_of_week_to_show'] ? createAdDto.show_conditions['date_of_week_to_show'] : null,
                range_of_hours_to_show: createAdDto.show_conditions['range_of_hours_to_show'] ? createAdDto.show_conditions['range_of_hours_to_show'] : null
            }).then(() => {
                return {
                    uuid: createAdDto.show_conditions['uuid'],
                    date_of_week_to_show: createAdDto.show_conditions['date_of_week_to_show'],
                    range_of_hours_to_show: createAdDto.show_conditions['range_of_hours_to_show']
                }
            })

        const ads = await setDoc(doc(this.db, "advertisement", createAdDto.uuid), {
            ads_name: createAdDto.ads_name,
            ads_remarks: createAdDto.ads_remarks,
            ads_type: createAdDto.ads_type,
            created_user_uuid: created_user_uuid,
            expiry_date: createAdDto.expiry_date,
            link_url: createAdDto.link_url,
            priority: createAdDto.priority,
            start_date: createAdDto.start_date,
            supplier_uuid: createAdDto.supplier_uuid,
            unit_price: createAdDto.unit_price,
            uuid: createAdDto.uuid,  
            banners: banners_collection,
            limiting_conditions: limiting_conditions_collection,
            show_conditions: show_conditions_collection,
        })
        .then(() => {
            return {
                uuid: createAdDto.uuid, unit_price: createAdDto.unit_price, supplier_uuid: createAdDto.supplier_uuid, 
                start_date: createAdDto.start_date, priority: createAdDto.priority,
                link_url: createAdDto.link_url, expiry_date: createAdDto.expiry_date, created_user_uuid: created_user_uuid, 
                ads_type: createAdDto.ads_type, ads_remarks: createAdDto.ads_remarks, 
                ads_name: createAdDto.ads_name, banners: createAdDto.banners, limiting_conditions: limiting_conditions_collection, show_conditions: show_conditions_collection
            }
        });
        return ads
    }

    async updateAd(@Param('uuid') uuid : string, @Body() updateAdDto : UpdateAdDto) {
        return uuid;
    }

    async deleteAd(@Param('uuid') uuid : string) {
        const docRef = doc(this.db, "advertisement", uuid);

        deleteDoc(docRef)
        .then(() => {
            return {
                message: "Entire Document has been deleted successfully."
            }
        })
        .catch(error => {
            return {
                error
            }
        })
    }

    async gellAllAd() {
        const querySnapshot = await getDocs(collection(this.db, "advertisement"));
        const result = querySnapshot.forEach((doc) => {
            return doc.data()
        })
        return result;
    }
}