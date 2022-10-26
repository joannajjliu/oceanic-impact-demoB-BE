import * as mongoose from 'mongoose';

export async function connectDatabase(mongo_uri: string, db_name: string): Promise<void> {
    await mongoose.connect(mongo_uri, {
        dbName: db_name,
    });

    mongoose.connection.on('error', (err) => {
        console.error(err);
        console.log('MongoDB connection error. Please make sure MongoDB is running.');
        process.exit(1); // Exit the process if the connection fails
    })

    mongoose.connection.on('connected', () => {
        console.log('Connected to MongoDB');
    });
}

export async function disconnectDatabase(): Promise<void> {
    await mongoose.disconnect();
}