import chai, { expect } from 'chai';
import request from 'supertest';

import app from '../app';

describe('GET api v0 base path hello world', function() {
    this.timeout(5000);
    // TODO: remove test route and this test
    it('should return a 200 at versioned test path', async function() {
        const response = await request(app)
            .get('/api/v0/')

        expect(response.status).to.equal(200);
        expect(response.type).to.equal('text/html');
        expect(response.text).to.equal('Hello World!');
    });
});