import * as mongoose from 'mongoose';

export async function connectDatabase(mongo_uri: string, db_name: string): Promise<void> {
    mongoose.connect(mongo_uri, {
        dbName: db_name,
    }, (err) => {
        if (err) {
            console.log(err);
            process.exit(1);
        } else {
            console.log('Connected to database');
        }
    });
}

export async function disconnectDatabase(): Promise<void> {
    await mongoose.disconnect();
}