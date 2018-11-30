const User = require("../models/user");
require("dotenv").load();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
// const {transport, makeNiceEmail} = require('../mail');

const UserType = `
    type User {
        _id: String!
        email: String!
        username: String!
        password: String!
        profileImageUrl: String
    }
    
    type SuccessMessage {
        message: String
    }
`;

const UserQuery =`
  users: [User]
  me: User
  user(_id: String): User
`;

const UserMutation = `
    updateUser(
        email: String
        username: String
        password: String
        profileImageUrl: String
    ) : User   
    login(
        email: String!, 
        password: String!
    ): User
    signup(
        email: String! 
        password: String!
        username: String!
    ): User
    logout: SuccessMessage
    requestReset(
        email: String!
    ): SuccessMessage
    resetPassword( 
        resetToken: String! 
        password: String!
        confirmPassword: String!
    ): User!
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
    signup: async (parent,args,ctx,info) => {
        args.email = args.email.toLowerCase();
        console.log('creating user');
        const hashedPassword = await bcrypt.hash(args.password, 10);
        const user = await User.create({
            username: args.username,
            email: args.email,
            password: hashedPassword,
        });
        //user
        const token = jwt.sign({userId: user._id}, process.env.APP_SECRET);

        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 2, //2 day cookie
        });
        return user;
    },
    login: async(parent, {email, password }, ctx, info) => {
        const user = await ctx.User.findOne({email});
        if(!user) {
            throw new Error('Sorry you need to sign up with an email ');
        }
        const valid = await bcrypt.compare(password, user.password);
        if(!valid) {
            throw new Error('Wrong password')
        }
        const token = jwt.sign({userId: user._id}, process.env.APP_SECRET);
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        return user;
    },
    logout: async(parent, {email, password }, ctx, info) => {
        ctx.response.clearCookie('token');
        return {message: 'Goodbye!'}
    },
    requestReset: async (parent, {email, password }, ctx, info) => {
        const user = await ctx.User.findOne({email});
        if(!user){
            throw new Error(`We couldn't find ${email}, want to try and sign up?`);
        }
        const pRandom = promisify(randomBytes);
        const resetToken = (await pRandom(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000;
        const res = await ctx.User.findOneAndUpdate({email}, {resetToken, resetTokenExpiry}, {new: true});
        const mailRes = await transport.sendMail({
            from: 'josh@rapidjaguar.com',
            to: user.email,
            subject: 'your password reset is available now!',
            html: makeNiceEmail(
                `your password reset is available now! \n\n 
                <a href=${process.env.CLIENT_URL}/reset?resetToken=${resetToken}
                `),
        });
        return { message: 'Cool!' }
    },
    resetPassword: async (parent, {resetToken, password, confirmPassword }, ctx, info) => {
        if(password !== confirmPassword) {
            throw new Error('your passwords seem a little off');
        }
        const resetUser = await ctx.User.findOne({resetToken: resetToken, resetTokenExpiry: { $gt: Date.now() - 3600000}});
        if(!resetUser) {
            throw new Error(`this token doesnt want to work, please try again`)
        }
        const newPassword = await bcrypt.hash(password, 10);
        const updatedUser = await ctx.User.findByIdAndUpdate(
            resetUser._id,
            { $set: {password: newPassword, resetToken: null, resetTokenExpiry: null }}
        );
        const token = jwt.sign({userId: updatedUser._id}, process.env.APP_SECRET);
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        return updatedUser;
    },
    updateUser: async (parent, args,{User}, info) => {
        let user = await User.findByIdAndUpdate(args._id.toString(),);
        user._id = user._id.toString();
        return user
    },
};
module.exports = {UserType, UserMutation, UserQuery, UserMutationResolver, UserQueryResolver};