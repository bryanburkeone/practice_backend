//this file connects to the remote mongodb
const { GraphQLServer } =  require('graphql-yoga');
const mongoose = require ('mongoose');
const nconf = require('nconf');
nconf.argv().env().file('keys.json');
const schema = require('./schema');

// mongoose models for graphql context
const User = require('./models/user');

const isProduction = process.env.NODE_ENV === 'production';

let user = nconf.get('mongoDevUser');
let pass = nconf.get('mongoDevPass');
let host = nconf.get('mongoDevHost');
let port = nconf.get('mongoDevPort');

if(!isProduction){
    user = nconf.get('mongoDevUser');
    pass = nconf.get('mongoDevPass');
    host = nconf.get('mongoDevHost');
    port = nconf.get('mongoDevPort');
}

let uri = `mongodb://${user}:${pass}@${host}:${port}`;
if(isProduction) {
    if (nconf.get('mongoDatabase')) {
        uri = `${uri}/${nconf.get('mongoDatabase')}`;
    }
} else {
    if (nconf.get('mongoDevDatabase')) {
        uri = `${uri}/${nconf.get('mongoDevDatabase')}`;
        console.log(uri);
    }
}

mongoose.set("debug", !isProduction);
mongoose.set('useCreateIndex', true);
mongoose.Promise = Promise;
mongoose.connect(uri, {
    keepAlive: true,
    useNewUrlParser: true,
});

function createServer() {
    return new GraphQLServer({
        schema,
        resolverValidationOptions: {
            requireResolversForResolveType: false
        },
        context: req => ({...req, User })
    })
}

module.exports = createServer;