const { makeExecutableSchema} = require('graphql-tools');
const resolvers = require('./resolvers');

//import schema
const {UserType, UserMutation, UserQuery} = require("./types/user");

//schema for graphql
const typeDefs = `
    scalar Date
    ${UserType}
    type Query {
        ${UserQuery}
    }
    type Mutation {
        ${UserMutation}
    }
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = schema;