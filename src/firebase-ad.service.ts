import { Body, HttpException, HttpStatus, Inject, Injectable, Module, Param, Res } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
var serviceAccount = require("../src/serviceAccountKey.json");

@Injectable()

export class FirebaseAdService {
    private db: FirebaseFirestore.Firestore;

    constructor(@Inject(ConfigService) private readonly config: ConfigService) {
        initializeApp({
            credential: cert(serviceAccount)
          });
        this.db = getFirestore();
    }

    async deleteAd(uuid : string) {
        const sfRef = this.db.collection('advertisement').doc(uuid);
        const collections = await sfRef.listCollections();
         
        // Delete in subcollection
        collections.forEach(collection => {            
            const collectionRef = this.db.collection(`advertisement/${uuid}/${collection.id}`);
            const query = collectionRef.orderBy('uuid').limit(10);

            return new Promise((resolve, reject) => {
                this.deleteQueryBatch(this.db, query, resolve).catch(reject);
            });
        });    
        
        // Delete all fields
        sfRef.delete();
    }
      
    async deleteQueryBatch(db, query, resolve) {
        const snapshot = await query.get();        
        const batchSize = snapshot.size;

        if (batchSize === 0) {
          // When there are no documents left, we are done
          resolve();
          return;
        }
      
        // Delete documents in a batch
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          this.deleteQueryBatch(db, query, resolve);
        });
    }
}