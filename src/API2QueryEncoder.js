import axios from 'axios';
export default class API2QueryEncoder {
    constructor() {
      this.reset();
      this.groupBy = [];
      this.encoded = '';
    }

    reset() {
        this.encoded = '';
        this.groupBy = [];
    }

    setQueryType(query_type) {
        this.encoded += `queryType=${query_type}^`;
        return this;
    }

    setJoinType(join_type) {
        this.encoded += `joinType=${join_type}^`;
        return this;
    }

    setTableReference(table) {
        this.encoded += `tableReference=${table}^`;
        return this;
    }

    setTargetColumn(column) {
        this.encoded += `targetColumn=${column}^`;
        return this;
    }

    setLocalColumn(column) {
        this.encoded += `localColumn=${column}^`;
        return this;
    }

    setOrderBy(column) {
        this.encoded += `orderBy=${column}^`;
        return this;
    
    }

    setOrderSymbol(symbol) {
        this.encoded += `orderSymbol=${symbol}^`;
        return this;
    }

    setLimit(limit) {
        this.encoded += `limitBy=${limit}^`;
        return this;
    }

    setOffset(offset) {
        this.encoded += `offsetBy=${offset}^`;
        return this;
        
    }

    setGroupedBy(columns) {
        if (Array.isArray(columns)) {
            columns = columns.join('$');
            console.error(columns);
        }
        this.encoded += `groupedBy=${columns}^`;
        return this;
    }
    setAnd() {
        this.encoded += '*AND*';
        return this;
    }

    setOr() {
        this.encoded += '*OR*';
        return this;
    }

    setCondition(condition) {
        this.encoded += `%${condition.identifier}${condition.operator}${condition.value}`;
        return this;
    }

    addJoin() {
        this.encoded += '&&';
        return this;
    }

    setParameter(key, value) {
        this.encoded += `${key}=${value}^`;
        return this;
    }

    encode() {
        // trim the first ^ character from the encoded string
        // this.encoded = this.encoded.slice(1);
        return this.encoded;
    }
    
    async decode() {
        let request = {
            action: "read",
            type: "data",
            body: {
                id: this.id,
                schema: this.schema,
                encoded: this.encoded
            }
        }
        // make request to the server
        let response = await axios.post(`${process.env.API_URL}/helpers/decode`, request);
        return response;
    }
    
}


