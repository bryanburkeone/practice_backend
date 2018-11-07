const UserType = `
    type User {
        _id: String 
        email: String
        username: String
        password: String
        profileImageUrl: String
    }
`;

const UserQuery =`
  users: [User]
  me: User
  user(_id: String): User
`;

const UserMutation = `
    createUser(
        profileImageUrl: String
        username: String
        email: String
        password: String
    ) : User   
`;

const UserQueryResolver = {
    users: async (parent, args, {User}) => {
        const users = await User.find({});
        return users.map(user => {
            user._id = user._id.toString();
            return user
        })
    },
    me: async (parent,args, ctx) => {
        if(!ctx.request.userId){
            return null;
        }
        return await ctx.User.findById(ctx.request.userId)
    },
    user: async (parent, args, {User}) => {
        return await User.findById(args._id)
    },
};

const UserMutationResolver = {
    createUser: async (parent, args,{User}, info) => {
        const user = await User.create({
            email: args.email,
            username: args.username,
        });

        return user
    },
};
module.exports = {UserType, UserMutation, UserQuery, UserMutationResolver, UserQueryResolver};