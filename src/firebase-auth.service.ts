import { Body, HttpException, HttpStatus, Inject, Injectable, Module, Param, Res } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, getDocs, getFirestore, setDoc, doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { UpdateUserProfileDto } from './dto/UpdateUserProfileDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { CreateAdDto } from "./dto/CreateAdDto";
import { UpdateAdDto } from "./dto/UpdateAdDto";
import { Response } from "express";

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
        const { ads_tags, banners, limiting_conditions, show_conditions, ...rest } = createAdDto;
        
        const ad = await setDoc(doc(this.db, "advertisement", createAdDto.uuid), {
            ...rest,  
        })
        .then(() => {
            return {
                uuid: createAdDto.uuid, 
                unit_price: createAdDto.unit_price, 
                supplier_uuid: createAdDto.supplier_uuid, 
                start_date: createAdDto.start_date, 
                priority: createAdDto.priority,
                link_url: createAdDto.link_url, 
                expiry_date: createAdDto.expiry_date, 
                created_user_uuid: created_user_uuid, 
                ads_type: createAdDto.ads_type, 
                ads_remarks: createAdDto.ads_remarks, 
                ads_name: createAdDto.ads_name
            }
        });
        
        const sub = async (currentObj : CreateAdDto) => {
            const subCollection = ['ads_tags', 'banners', 'limiting_conditions', 'show_conditions'];
            Object.keys(currentObj).forEach(async key => {
                if (subCollection.includes(key)) {
                    await setDoc(doc(this.db, "advertisement", createAdDto.uuid, key, createAdDto.uuid), currentObj[key]).then(() => {     

                    })
                }
                if (typeof currentObj[key] === 'object' && currentObj[key] !== null) {
                    sub(currentObj[key])
                }
            })
        }
        sub(createAdDto)

        return { ... ad, sub }
                   

        
        // const banners_collection = doc(this.db, "advertisement", createAdDto.uuid, "banners", createAdDto.uuid);             
        //     await setDoc(banners_collection, banners).then(() => {                
        //         return { uuid: banners['uuid'], firestore_path: banners['firestore_path'], 
        //         banner_group: banners['banner_group'], order: banners['order'] }
        //     })

        // const ads_tags_collection = doc(this.db, "advertisement", createAdDto.uuid, "ads_tag", createAdDto.uuid);
        //     await setDoc(ads_tags_collection, ads_tags).then(() => {
        //         return { tag_uuid: ads_tags['tag_uuid'] }
        //     })

        // const limiting_conditions_collection = doc(this.db, "advertisement", createAdDto.uuid, "limiting_conditions", createAdDto.uuid)
        //     await setDoc(limiting_conditions_collection, limiting_conditions).then(() => {
        //         return {
        //             uuid: limiting_conditions['uuid'],
        //             tag_uuid: limiting_conditions['tag_uuid'],
        //             minimun: limiting_conditions['minimun'],
        //             maximun: limiting_conditions['maximun']
        //         }
        //     })
        
        // const show_conditions_collection = doc(this.db, "advertisement", createAdDto.uuid , "show_conditions", createAdDto.uuid);
        //     await setDoc(show_conditions_collection, show_conditions).then(() => {
        //         return {
        //             uuid: show_conditions['uuid'],
        //             date_of_week_to_show: show_conditions['date_of_week_to_show'],
        //             range_of_hours_to_show: show_conditions['range_of_hours_to_show']
        //         }
        //     })


    }

    async updateAd(@Param('uuid') uuid : string, @Body() updateAdDto : UpdateAdDto) {
        const created_user_uuid = this.auth.currentUser ? this.auth.currentUser.uid : "xxx";
        const { ads_tags, banners, limiting_conditions, show_conditions, ...rest } = updateAdDto;
        
        const banners_collection = doc(this.db, "advertisement", updateAdDto.uuid, "banners", updateAdDto.uuid);             
            await updateDoc(banners_collection, banners).then(() => {                
                return { uuid: banners['uuid'], firestore_path: banners['firestore_path'], 
                banner_group: banners['banner_group'], order: banners['order'] }
            })

        const ads_tags_collection = doc(this.db, "advertisement", updateAdDto.uuid, "ads_tag", updateAdDto.uuid);
            await updateDoc(ads_tags_collection, ads_tags).then(() => {
                return { tag_uuid: ads_tags['tag_uuid'] }
            })

        const limiting_conditions_collection = doc(this.db, "advertisement", updateAdDto.uuid, "limiting_conditions", updateAdDto.uuid)
            await updateDoc(limiting_conditions_collection, limiting_conditions).then(() => {
                return {
                    uuid: limiting_conditions['uuid'],
                    tag_uuid: limiting_conditions['tag_uuid'],
                    minimun: limiting_conditions['minimun'],
                    maximun: limiting_conditions['maximun']
                }
            })
        
        const show_conditions_collection = doc(this.db, "advertisement", updateAdDto.uuid , "show_conditions", updateAdDto.uuid);
            await updateDoc(show_conditions_collection, show_conditions).then(() => {
                return {
                    uuid: show_conditions['uuid'],
                    date_of_week_to_show: show_conditions['date_of_week_to_show'],
                    range_of_hours_to_show: show_conditions['range_of_hours_to_show']
                }
            })

        const ads = await updateDoc(doc(this.db, "advertisement", updateAdDto.uuid), {
            ...rest,  
            banners: banners_collection,
            limiting_conditions: limiting_conditions_collection,
            show_conditions: show_conditions_collection,
        })
        .then(() => {
            return {
                uuid: updateAdDto.uuid, unit_price: updateAdDto.unit_price, supplier_uuid: updateAdDto.supplier_uuid, 
                start_date: updateAdDto.start_date, priority: updateAdDto.priority,
                link_url: updateAdDto.link_url, expiry_date: updateAdDto.expiry_date, created_user_uuid: created_user_uuid, 
                ads_type: updateAdDto.ads_type, ads_remarks: updateAdDto.ads_remarks, 
                ads_name: updateAdDto.ads_name, banners: banners, limiting_conditions: limiting_conditions_collection, show_conditions: show_conditions_collection
            }
        });
        return ads
    }

    async deleteAd(@Param('uuid') uuid : string) {
        const docRef = doc(this.db, "advertisement", uuid);


        const querySnapshot = await getDocs(collection(this.db, "advertisement/uuid15/banners"));
        querySnapshot.forEach((doc) => {
            console.log(doc.data());
            return doc.data()
        })
        // return (collection(this.db, "advertisement/uui15/banners"));
        // return await deleteDoc(docRef)
        // .then(() => {
        //     return {
        //         message: `The ad with #${uuid} has been removed `
        //     }
        // })
        // .catch(() => {
        //     throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        // })
    }

    async gellAllAd() {
        const querySnapshot = await getDocs(collection(this.db, "advertisement/uui15/banners/uuid15"));
        querySnapshot.forEach((doc) => {
            console.log(doc);
            return doc
        })

    }
}