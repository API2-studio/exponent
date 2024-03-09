// Code for testing the API2Request class
//
import { API2Request } from '../src/index';
import dotenv from 'dotenv';
dotenv.config();

describe('API2Request', () => {
    let request;
    
    beforeEach(() => {
        request = new API2Request(process.env.API_URL, { 'Authorization': `Bearer ${process.env.API_KEY}` }, { limit: 10, offset: 0 });
    });

    it('should make a GET request', async () => {
        const response = await request.get('users');
        expect(response[0].name).toEqual('admin');
    });

    it('should make a POST request', async () => {
        const response = await request.post('users', { name: 'admin' });
        expect(response.name).toEqual('admin');
    });

    it('should make a PUT request', async () => {
        const response = await request.put('users/1', { name: 'admin' });
        expect(response.name).toEqual('admin');
    });

    it('should make a DELETE request', async () => {
        const response = await request.delete('users/1');
        expect(response).toEqual({});
    });
});
    