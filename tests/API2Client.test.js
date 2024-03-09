// tests for the API2Client class
//

import API2Client from "../src/API2Client";
import dotenv from "dotenv";
// import axios from "axios";
dotenv.config();

describe("API2Client", () => {
    let client;
    
    beforeEach(() => {
        client = new API2Client({
        baseURL: process.env.API_URL,
        headers: { Authorization: `Bearer ${process.env.API_KEY}` },
        params: { limit: 10, offset: 0 },
        });
    });
    
    it("should set the client secret", () => {
        client.setClientSecret("newSecret");
        expect(client.clientSecret).toEqual("newSecret");
    });
    
    it("should set the client id", () => {
        client.setClientId("newId");
        expect(client.clientId).toEqual("newId");
    });
    
    it("should set the base URL", () => {
        client.setBaseURL("newURL");
        expect(client.baseURL).toEqual("newURL");
    });
    
    it("should set a header", () => {
        client.setHeader("newHeader", "newValue");
        expect(client.headers.newHeader).toEqual("newValue");
    });
    
    it("should set params", () => {
        client.setParams({ newParam: "newValue" });
        expect(client.params.newParam).toEqual("newValue");
    });
    
    it("should build a request", () => {
        client.buildRequest();
        expect(client.request.baseURL).toEqual(process.env.API_URL);
        expect(client.request.headers).toEqual({ Authorization: `Bearer ${process.env.API_KEY}` });
        expect(client.request.params).toEqual({ limit: 10, offset: 0 });
    });
    
    it("should make a request", async () => {
        const response = await client.makeRequest("get", "users");
        expect(response[0].name).toEqual("admin");
    });
});
