

## Overview
The SDK we've developed serves as an interface to API2, providing a structured and efficient way to interact with the API. API2 appears to be a versatile and powerful API, allowing for a wide range of operations, including data manipulation, querying, and schema definition. The SDK abstracts the complexity of direct API calls into a set of easy-to-use classes and methods, enabling developers to focus more on the logic of their applications rather than the intricacies of the API communication.

### Overview of the SDK Components:

1. **API2Client**: This class sets up the initial configuration for the API client, including the base URL, client ID, client secret, and any global headers or parameters. It's the entry point for creating API requests.

2. **API2Request**: Responsible for executing HTTP requests such as GET, POST, PUT, and DELETE. It utilizes Axios for making these requests and handles the construction of the full request URL, including path and query parameters, as well as setting request headers.

3. **API2RequestBuilder**: Offers a fluent interface for building customized API requests. It allows for setting up request-specific headers, parameters, and the request path. After configuring the request, it utilizes the API2Request class to execute the call.

4. **API2SchemaBuilder**: Facilitates defining the structure of data for API requests. It supports setting parameters with options for both read and post operations, thus allowing for detailed customization of the request payload and response format.

5. **API2QueryEncoder**: This class is used for encoding complex query operations, supporting a variety of operations like setting query types, join types, table references, conditions, and more. It's particularly useful for constructing complex queries that involve multiple tables and conditions.

### Key Features of the SDK:

- **Fluent Interface**: The SDK employs a fluent interface, making the code more readable and easier to write. This approach allows chaining method calls, making the construction of requests more intuitive.

- **Abstraction and Simplification**: By abstracting the details of HTTP request construction and execution, the SDK simplifies interacting with API2. Developers can perform complex operations with minimal code, improving development efficiency.

- **Flexibility and Extensibility**: The SDK's structure allows for easy extension. Developers can add new functionality or customize existing features to meet specific requirements.

- **Error Handling**: Through the use of promises and async/await syntax, the SDK provides robust error handling mechanisms, allowing developers to catch and handle errors gracefully.

- **Detailed Configuration**: With the ability to set global configurations as well as request-specific parameters and headers, the SDK offers detailed control over the requests made to API2.

This SDK is designed to be both powerful and user-friendly, catering to the needs of developers who require a reliable and efficient way to interact with API2 for a wide range of applications.


### API2Client

The `API2Client` class is used to configure and create an API client for making requests. It allows setting the base URL, client ID, client secret, additional headers, and parameters.

#### Example Usage:
```javascript
const client = new API2Client();
client
    .setBaseURL('https://api.example.com')
    .setClientId('my-client-id')
    .setClientSecret('my-client-secret')
    .setHeader('Authorization', 'Bearer my-token')
    .setParams({ key: 'value' })
    .buildRequest();
```

### API2Request

`API2Request` is responsible for executing the actual HTTP requests. It supports GET, POST, PUT, and DELETE methods.

#### Example Usage:
```javascript
// Assuming 'client' is an instance of API2Client
const request = client.buildRequest();
request.get('path/to/resource')
       .then(response => console.log(response))
       .catch(error => console.error(error));
```

### API2RequestBuilder

This class provides a fluent interface to build and customize API requests, including setting headers and parameters. It uses `API2Request` internally to execute the requests.

#### Example Usage:
```javascript
const requestBuilder = new API2RequestBuilder()
                           .setBaseURL('https://api.example.com')
                           .setHeader('Authorization', 'Bearer my-token')
                           .setParams({ key: 'value' })
                           .buildRequest();

requestBuilder.get('path/to/resource')
              .then(response => console.log(response))
              .catch(error => console.error(error));
```

### API2SchemaBuilder

Used to define the structure of the data for API requests, `API2SchemaBuilder` supports setting parameters for both read and post operations, including their options.

#### Example Usage:
```javascript
const schema = new API2SchemaBuilder()
                   .setPostParam('name', 'string', { required: true })
                   .setReadParam('id', 'tasks.id')
                   .build();
```

### API2QueryEncoder

The `API2QueryEncoder` class is for encoding query parameters for complex query operations. It supports various operations like setting query types, join types, and table references.

#### Example Usage:
```javascript
const encoder = new API2QueryEncoder()
                    .setQueryType('join')
                    .setJoinType('inner')
                    .setTableReference('users')
                    .setTargetColumn('users.id')
                    .setLocalColumn('tasks.assigned_to')
                    setCondition({identifier: "users.name", operator: "=", value: "admin"})
                    .encode();
```

### Error Handling
Errors in the SDK are thrown by the underlying HTTP request mechanism and should be caught using `try-catch` blocks or `.catch()` on promises.

#### Example:
```javascript
request.get('path/to/resource')
       .then(response => console.log(response))
       .catch(error => console.error('Error:', error));
```

