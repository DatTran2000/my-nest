import { Inject, Injectable, Module } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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
    
    getLogin(@Req() req : Request) {
        
        signInWithEmailAndPassword(this.auth, req.body['email'], req.body['password'])
        .then((userCredential) => {
        const user = userCredential.user;
            // console.log(user);         
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
    }
}