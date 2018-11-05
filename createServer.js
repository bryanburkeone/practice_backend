const { GraphQLServer } = require('graphql-yoga')

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`

const resolvers = {
    Query: {
        hello: (_, { name }) => `Hello ${name || 'World'}`,
    },
}

// Create the GraphQL Yoga Server

function createServer() {
    return new GraphQLServer({
        typeDefs,
        resolvers,
        resolverValidationOptions: {
            requireResolversForResolveType: false,
        },
        // context: req => ({ ...req, db }),
    });
}

module.exports = createServer;

