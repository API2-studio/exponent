// Code for testing the API2QueryEncoder class
//
import { API2QueryEncoder } from '../src/index';
import { API2RequestBuilder } from '../src/index';
import dotenv from 'dotenv';
dotenv.config();



describe('API2QueryEncoder', () => {
    let encoder;
    
    beforeEach(() => {
        encoder = new API2QueryEncoder();
    });
    
    afterEach(() => {
        encoder.reset();
    });

    it('should encode a simple query', () => {
        const query = encoder
        .setQueryType('condition')
        .setCondition({identifier: 'name', operator: '=', value: 'John'})
        .encode()

        expect(query).toBe('queryType=condition^%name=John');
    });

    it('should encode a complex query', () => {
        const query = encoder
        .setQueryType('join')
        .setJoinType('inner')
        .setTableReference('users')
        .setTargetColumn('users.id')
        .setLocalColumn('tasks.user_id')
        .setOrderBy('users.name')
        .setOrderSymbol('DESC')
        .setLimit(10)
        .setOffset(0)
        .setGroupedBy(['users.name', 'users.age'])
        .setCondition({identifier: 'users.name', operator: '=', value: 'John' })
        .setAnd()
        .setCondition({identifier: 'users.age', operator: '>', value: 25})
        .encode()

        expect(query).toBe('queryType=join^joinType=inner^tableReference=users^targetColumn=users.id^localColumn=tasks.user_id^orderBy=users.name^orderSymbol=DESC^limitBy=10^offsetBy=0^groupedBy=users.name$users.age^%users.name=John*AND*%users.age>25');
    });

    it('should encode a multiple join query', () => {
        const query = encoder
        .setQueryType('join')
        .setJoinType('inner')
        .setTableReference('users')
        .setTargetColumn('users.id')
        .setLocalColumn('tasks.user_id')
        .setOrderBy('users.name')
        .setOrderSymbol('DESC')
        .setLimit(10)
        .setOffset(0)
        .setGroupedBy(['users.name', 'users.age'])
        .setCondition({identifier: 'users.name', operator: '=', value: 'John' })
        .setAnd()
        .setCondition({identifier: 'users.age', operator: '>', value: 25})
        .addJoin()
        .setQueryType('join')
        .setJoinType('left')
        .setTableReference('tasks')
        .setTargetColumn('tasks.id')
        .setLocalColumn('comments.task_id')
        .setOrderBy('tasks.name')
        .setOrderSymbol('DESC')
        .setCondition({identifier: 'tasks.name', operator: '=', value: 'Task 1' })
        .setAnd()
        .setCondition({identifier: 'tasks.status', operator: '=', value: 'completed'})
        .encode()

        expect(query).toBe('queryType=join^joinType=inner^tableReference=users^targetColumn=users.id^localColumn=tasks.user_id^orderBy=users.name^orderSymbol=DESC^limitBy=10^offsetBy=0^groupedBy=users.name$users.age^%users.name=John*AND*%users.age>25&&queryType=join^joinType=left^tableReference=tasks^targetColumn=tasks.id^localColumn=comments.task_id^orderBy=tasks.name^orderSymbol=DESC^%tasks.name=Task 1*AND*%tasks.status=completed');
    });

    it('should encode a query with a group by', () => {
        const query = encoder
        .setQueryType('condition')
        .setGroupedBy('age')
        .setCondition({identifier: 'name', operator: '=', value: 'John'})
        .encode()
        
        expect(query).toBe('queryType=condition^groupedBy=age^%name=John');
    });
    
    it('should encode a query with a limit', () => {
        const query = encoder
        .setQueryType('condition')
        .setLimit(10)
        .setCondition({identifier: 'name', operator: '=', value: 'John'})
        .encode()

        expect(query).toBe('queryType=condition^limitBy=10^%name=John');
    });

    it('should encode a query with an offset', () => {

        const query = encoder
        .setQueryType('condition')
        .setOffset(10)
        .setCondition({identifier: 'name', operator: '=', value: 'John'})
        .encode()

        expect(query).toBe('queryType=condition^offsetBy=10^%name=John');
    });

    it('should encode a query with an order by', () => {

        const query = encoder
        .setQueryType('condition')
        .setOrderBy('age')
        .setOrderSymbol('DESC')
        .setCondition({identifier: 'name', operator: '=', value: 'John'})
        .encode()

        expect(query).toBe('queryType=condition^orderBy=age^orderSymbol=DESC^%name=John');
    });

    it ('should encode a query with an AND condition', () => {
        const query = encoder
        .setQueryType('condition')
        .setCondition({identifier: 'name', operator: '=', value: 'John'})
        .setAnd()
        .setCondition({identifier: 'age', operator: '>', value: 25})
        .encode()
        expect(query).toBe('queryType=condition^%name=John*AND*%age>25');
    });


    it('should encode a query with an OR condition', () => {
        const query = encoder
        .setQueryType('condition')
        .setCondition({identifier: 'name', operator: '=', value: 'John'})
        .setOr()
        .setCondition({identifier: 'age', operator: '>', value: 25})
        .encode()

        expect(query).toBe('queryType=condition^%name=John*OR*%age>25');
    });

    it('should encode a query with parameters', () => {
        const query = encoder
        .setQueryType('condition')
        .setCondition({identifier: 'name', operator: '=', value: 'John'})
        .setAnd()
        .setCondition({identifier: 'age', operator: '>', value: 25})
        .encode()

        expect(query).toBe('queryType=condition^%name=John*AND*%age>25');
    });

    
});

describe('API2RequestBuilder', () => {
    let builder;
    
    beforeEach(() => {
        builder = new API2RequestBuilder();
    });
    
    afterEach(() => {
        builder.reset();
    });

    it('should set the base URL', () => {
        builder.setBaseURL('https://api.example.com');
        expect(builder.baseURL).toBe('https://api.example.com');
    });

    it('should set a header', () => {
        builder.setHeader
        ('Authorization', 'Bearer 12345');
        expect(builder.headers).toEqual({ 'Authorization': 'Bearer 12345' });
    });

    it('should set multiple headers', () => {
        builder
        .setHeader('Authorization', 'Bearer 12345') 
        .setHeader('Content-Type', 'application/json');
        expect(builder.headers).toEqual({ 'Authorization': 'Bearer 12345', 'Content-Type': 'application/json' });
    });

    it('should set a parameter', () => {
        builder.setParams({ limit: 10 });
        expect(builder.params).toEqual({ limit: 10 });
    });

    it('should set multiple parameters', () => {
        builder
        .setParams({ limit: 10 })
        .setParams({ offset: 0 });
        expect(builder.params).toEqual({ limit: 10, offset: 0 });
    });

    it('should build a request', () => {
        builder
        .setBaseURL('https://api.example.com')
        .setHeader('Authorization', 'Bearer 12345')
        .setParams({ limit: 10 })
        .setParams({ offset: 0 });
        const request = builder.buildRequest();
        expect(request.baseURL).toBe('https://api.example.com');
        expect(request.headers).toEqual({ 'Authorization': 'Bearer 12345' });
        expect(request.params).toEqual({ limit: 10, offset: 0 });
    });

    it('should make a GET request', async () => {
        builder
        .setBaseURL(process.env.API_URL)
        .setHeader('Authorization', `Bearer ${process.env.API_KEY}`)
        .setParams({ limit: 10 })
        .setParams({ offset: 0 });
        const response = await builder.get('users');
        expect(response.data[0].name).toEqual('admin');
    });

    it('should make a POST request', async () => {
        builder
        .setBaseURL(process.env.API_URL)
        .setHeader('Authorization', `Bearer ${process.env.API_KEY}`)
        .setParams({ limit: 10 })
        .setParams({ offset: 0 });
        const response = await builder.post('users', { name: 'admin' });
        expect(response.data.name).toEqual('admin');
    });

    it('should make a PUT request', async () => {
        builder
        .setBaseURL(process.env.API_URL)
        .setHeader('Authorization', `Bearer ${process.env.API_KEY}`)
        .setParams({ limit: 10 })
        .setParams({ offset: 0 });
        const response = await builder.put('users/1', { name: 'admin' });
        expect(response.data.name).toEqual('admin');
    });

    it('should make a DELETE request', async () => {
        builder
        .setBaseURL(process.env.API_URL)
        .setHeader('Authorization', `Bearer ${process.env.API_KEY}`)
        .setParams({ limit: 10 })
        .setParams({ offset: 0 });
        const response = await builder.delete('users/1');
        expect(response.data).toEqual({});
    });

    it('should decode a response', async () => {
        builder
        .setBaseURL(process.env.API_URL)
        .setHeader('Authorization', `Bearer ${process.env.API_KEY}`)
        .setParams({ limit: 10 })
        .setParams({ offset: 0 });
        const response = await builder.get('users');
        expect(response.data[0].name).toEqual('admin');
    });
});

describe('API2Client', () => {
    let client;
    
    beforeEach(() => {
        client = new API2RequestBuilder();
    });
    
    afterEach(() => {
        client.reset();
    });

    it('should make a GET request', async () => {
        client
        .setBaseURL(process.env.API_URL)
        .setHeader('Authorization', `Bearer ${process.env.API_KEY}`)
        .setParams({ page: 1, page_sie: 10 });
        const response = await client.get('users');
        expect(response.data[0].name).toEqual('admin');
    });

    it('should make a POST request', async () => {
        client
        .setBaseURL(process.env.API_URL)
        .setHeader('Authorization', `Bearer ${process.env.API_KEY}`)
        .setParams({ page: 1, page_sie: 10 });
        const response = await client.post('users', { name: 'admin' });
        expect(response.data.name).toEqual('admin');
    });

    it('should decode a response', async () => {
        client
        .setBaseURL(process.env.API_URL)
        .setHeader('Authorization', `Bearer ${process.env.API_KEY}`)
        .setParams({ limit: 10 })
        .setParams({ offset: 0 });
        const response = await client.get('users');
        expect(response.data[0].name).toEqual('admin');
    });
});