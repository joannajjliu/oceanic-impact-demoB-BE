import { expect } from 'chai';
import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';

import { connectDatabase, disconnectDatabase } from '@/db';
import { MongoMemoryServer } from 'mongodb-memory-server';

import App from '../app';
import { IUser } from '@/models/users.model';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    connectDatabase(uri, 'test'); // Connect to the in-memory database
});

after(async () => {
    await disconnectDatabase();
    await mongod.stop(); // stop the in-memory database
});

describe('GET api v0 base path hello world', function() {
    const app_: App = new App();
    this.timeout(1000);
    // TODO: remove test route and this test
    it('should return a 200 at versioned test path', async function() {
        const response = await request(app_.app)
            .get('/api/v0/')

        expect(response.status).to.equal(200);
        expect(response.type).to.equal('text/html');
        expect(response.text).to.equal('Hello World!');
    });
});

describe('get all users', function() {
    const app_: App = new App();
    this.timeout(1000);
    // create test user
    const users = mongoose.model<IUser>('User');
    users.create({
        name: 'test',
        email: 'test@example.com',
        password: 'test',
    });

    it('should return a 200 and an array of users', async function() {
        const all_users = await request(app_.app)
            .get('/api/v0/users')

        expect(all_users.status).to.equal(200);
        expect(all_users.type).to.equal('application/json');
        expect(all_users.body.users).to.be.an('array');
        expect(all_users.body.users).to.have.lengthOf(1); // only one user in the database
    });
});