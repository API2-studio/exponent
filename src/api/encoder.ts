import API2Client from '../core/client';

export class EncoderAPI {
    constructor(
        private client: API2Client,
        private encoded: string = '', 
        private groupBy: string[] = []
    ) { }

    // reset the encoder
    reset() {
        this.encoded = '';
        this.groupBy = [];
    }

    // set the query type
    setEncoded(encoded) {
        this.encoded = encoded;
        return this;
    }

    getEncoded() {
        return this.encoded;
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
        } else {
            columns = columns;
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

    setOpenParenthesis() {
        this.encoded += '[';
        return this;
    }

    setCloseParenthesis() {
        this.encoded += ']';
        return this;
    }

    build() {
        return this.encoded;
    }

    encode() {
        return encodeURIComponent(this.encoded);
    }
    
}
    
