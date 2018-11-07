const lodash = require('lodash');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

//mongoose models
const User = require('./models/user');


//resolver imports from types files
const {UserQueryResolver, UserMutationResolver, UserNested} = require("./types/user");


//Merged Query Resolvers
const Queries =
    lodash.merge(
        UserQueryResolver,
    );

//merged mutation resolvers
const Mutations =
    lodash.merge(
        UserMutationResolver,
    );

// final product for graphql resolvers
const resolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        },
    }),
    Query: Queries,
    Mutation: Mutations,
};

module.exports = resolvers;