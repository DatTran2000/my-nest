import { Inject, Injectable, Module } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from "@nestjs/common";

@Injectable()

export class FirebaseAuthService {
    private auth;

    constructor(@Inject(ConfigService) private readonly config:ConfigService) {
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
    }
    
    async getLogin(@Req() req : Request) {
        const { stsTokenManager: { accessToken, refreshToken, expirationTime }, uid } = await signInWithEmailAndPassword(this.auth, req.body['email'], req.body['password'])
        .then((userCredential) => {            
            return userCredential.user;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            return { ... errorMessage, ... errorCode };
        });
        return { accessToken, refreshToken, expirationTime, uid }    
    }

    async updateUser(@Req() req : Request) {
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
}