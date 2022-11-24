import { Inject, Injectable, Module } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from "@nestjs/common";
import { collection, getDocs, getFirestore, setDoc, doc } from "firebase/firestore";

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

    async getLogin(@Req() req: Request) {
        const { stsTokenManager: { accessToken, refreshToken, expirationTime }, uid } = await signInWithEmailAndPassword(this.auth, req.body['email'], req.body['password'])
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

    async updateUser(@Req() req: Request) {
        const displayName = req.body['displayName'];
        const photoURL = req.body['photoURL'];

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

    async createAd(@Req() req: Request) {
        const ads_game = req.body['ads_game'];
        const ads_remarks = req.body['ads_remarks'];
        const ads_type = req.body['ads_type'];
        const created_user_uuid = this.auth.currentUser != null ? this.auth.currentUser.uid : "xxx";
        const expiry_date = req.body['expiry_date'];
        const link_url = req.body['link_url'];
        const priority = req.body['priority'];
        const start_date = req.body['start_date'];
        const supplier_uuid = req.body['supplier_uuid'];
        const unit_price = req.body['unit_price'];
        const uuid = req.body['uuid'];

        const ads_tags = req.body['ads_tags'];
        const banners = req.body['banners'];
        const limiting_conditions = req.body['limiting_conditions'];
        const show_conditions = req.body['show_conditions'];

        const ads = await setDoc(doc(this.db, "advertisement", created_user_uuid), {
            ads_game: ads_game,
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
            ads_tags: ads_tags,
            banners: banners,
            limiting_conditions: limiting_conditions,
            show_conditions: show_conditions
        }).then(() => {
            return {
                uuid, unit_price, supplier_uuid, start_date, priority,
                link_url, expiry_date, created_user_uuid, ads_type, ads_remarks, 
                ads_game, ads_tags, banners, limiting_conditions, show_conditions
            }
        });

        return ads
    }
}