import { Body, HttpException, HttpStatus, Inject, Injectable, Module, Param, Res } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApp } from "firebase/app";
import { Auth, getAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, getDocs, getFirestore, setDoc, doc, deleteDoc, getDoc, updateDoc, Firestore } from "firebase/firestore";
import { UpdateUserProfileDto } from './dto/UpdateUserProfileDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { CreateAdDto } from "./dto/CreateAdDto";
import { UpdateAdDto } from "./dto/UpdateAdDto";

@Injectable()

export class FirebaseAuthService {
    private auth: Auth;
    private db: Firestore;

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
        
        await setDoc(doc(this.db, "advertisement", createAdDto.uuid), {
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
                    if(Array.isArray(currentObj[key] && currentObj[key].length > 0 )) {
                        for(let i = 0; i < currentObj[key].length; i ++) {
                            await setDoc(doc(this.db, "advertisement", createAdDto.uuid, key, currentObj[key][i].uuid), currentObj[key][i]);
                        }
                    } else {
                        await setDoc(doc(this.db, "advertisement", createAdDto.uuid, key, createAdDto.uuid), currentObj[key]);
                    }
                }
                if (typeof currentObj[key] === 'object' && currentObj[key] !== null) {
                    sub(currentObj[key])
                }
            })
        }
        sub(createAdDto)        

        return { ...createAdDto }
    }

    async updateAd(@Param('uuid') uuid : string, @Body() updateAdDto : UpdateAdDto) {
        const created_user_uuid = this.auth.currentUser ? this.auth.currentUser.uid : "xxx";
        const { ads_tags, banners, limiting_conditions, show_conditions, ...rest } = updateAdDto;
        
        await setDoc(doc(this.db, "advertisement", updateAdDto.uuid), {
            ...rest,  
        })
        .then(() => {
            return {
                uuid: updateAdDto.uuid, 
                unit_price: updateAdDto.unit_price, 
                supplier_uuid: updateAdDto.supplier_uuid, 
                start_date: updateAdDto.start_date, 
                priority: updateAdDto.priority,
                link_url: updateAdDto.link_url, 
                expiry_date: updateAdDto.expiry_date, 
                created_user_uuid: created_user_uuid, 
                ads_type: updateAdDto.ads_type, 
                ads_remarks: updateAdDto.ads_remarks, 
                ads_name: updateAdDto.ads_name
            }
        });
        
        const sub = async (currentObj : UpdateAdDto) => {
            const subCollection = ['ads_tags', 'banners', 'limiting_conditions', 'show_conditions'];
            Object.keys(currentObj).forEach(async key => {
                if (subCollection.includes(key)) {
                    if(Array.isArray(currentObj[key] && currentObj[key].length > 0 )) {
                        for(let i = 0; i < currentObj[key].length; i ++) {
                            await setDoc(doc(this.db, "advertisement", updateAdDto.uuid, key, currentObj[key][i].uuid), currentObj[key][i]);
                        }
                    } else {
                        await setDoc(doc(this.db, "advertisement", updateAdDto.uuid, key, updateAdDto.uuid), currentObj[key]);
                    }
                }
                if (typeof currentObj[key] === 'object' && currentObj[key] !== null) {
                    sub(currentObj[key])
                }
            })
        }
        sub(updateAdDto)        

        return { ...updateAdDto }
    }

     
    async gellAllAd() {
        const querySnapshot = await getDocs(collection(this.db, 'advertisement/uuid1/banners'));
        const result = [];
        const subCollection = [
          'ads_tags',
          'banners',
          'limiting_conditions',
          'show_conditions',
        ];
    
        querySnapshot.forEach((doc) => {
          result.push(doc.data());
        });
    
        for (const item of result) {
          for (const sub of subCollection) {
            const querySubSnapshot: any = await getDocs(
              collection(this.db, `advertisement/${item.uuid}/${sub}`),
            );
            querySubSnapshot.forEach((subItem) => {
              Object.assign(item, { [`${sub}`]: subItem.data() });
            });
          }
        }
    
        return result;
    }
}