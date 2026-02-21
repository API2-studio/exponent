// Module for fetching data from the API2



import APIClient from '../core/client';
import  { EncoderAPI } from './encoder';



export class DataAPI {
    constructor(private client: APIClient, private encoder: EncoderAPI) { }

    addEncoder(encoder: EncoderAPI) {
        this.encoder = encoder;
    }

    encoderReset() {
        this.encoder.reset();
    }

    // Get encoded query for the request
    getEncoded() {
        return this.encoder.getEncoded();
    }

    setQueryType(query_type: string) {
        this.encoder.setQueryType(query_type);
    }

    setJoinType(join_type: string) {
        this.encoder.setJoinType(join_type);
    }

    setTableReference(table: string) {
        this.encoder.setTableReference(table);
    }

    setTargetColumn(column: string) {
        this.encoder.setTargetColumn(column);
    }

    setLocalColumn(column: string) {
        this.encoder.setLocalColumn(column);
    }

    setOrderBy(column: string) {
        this.encoder.setOrderBy(column);
    }

    setOrderSymbol(symbol: string) {
        this.encoder.setOrderSymbol(symbol);
    }

    setLimit(limit: number) {
        this.encoder.setLimit(limit);
    }

    setOffset(offset: number) {
        this.encoder.setOffset(offset);
    }

    setGroupedBy(groupBy: string[]) {
        this.encoder.setGroupedBy(groupBy);
    }

    setCondition(condition: any) {
        this.encoder.setCondition({
            identifier: condition.identifier,
            operator: condition.operator,
            condition: condition.value
        });
    }

    setAnd() {
        this.encoder.setAnd();
    }

    setOr() {
        this.encoder.setOr();
    }

    setOpenParentheses() {
        this.encoder.setOpenParenthesis();
    }

    setCloseParentheses() {
        this.encoder.setCloseParenthesis();
    }

    addJoin() {
        this.encoder.addJoin();
    }
    // Set the encoded query in the query for the request
    setEncodedQuery(encoded: string) {
        this.encoder.setEncoded(encoded);
    }

    // Get the encoded query
    getEncodedQuery() {
        return this.encoder.getEncoded();
    }

    // Get all data
    getAllData(query: any) {
        return this.client.request('GET', '/api/v1/data?', query);
    }

    // Get record by ID
    getData(dataId: string, query: any) {
        // console.log(dataId);
        // console.log(query);
        return this.client.request('GET', `/api/v1/data/${dataId}?`, query);
    }

    // Get all records by table ID
    listData(tableId: string, query: any) {
        return this.client.request('GET', `/api/v1/data/${tableId}?`, query);
    }
    
    // Create a new record
    createData(data: any) {
        return this.client.request('POST', '/api/v1/data', data);
    }

    // Update a record
    updateData(dataId: string, data: any) {
        return this.client.request('PUT', `/api/v1/data/${dataId}`, data);
    }
    
    // Delete a record
    deleteData(dataId: string) {
        return this.client.request('DELETE', `/api/v1/data/${dataId}`);
    }
}