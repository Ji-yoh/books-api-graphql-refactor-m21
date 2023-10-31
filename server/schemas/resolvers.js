// add resolvers to the server, refactor from user-controller.js
const  { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({ $or:
                     [{_id: context.user._id}, {username: context.user.username}]
                    })
                .select('__v -password')
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        }
    },
    Mutation: { // add login, addUser, saveBook, removeBook mutations
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
            return {token, user};
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return {token, user};
        },
        saveBook: async (parent, {bookData}, context) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id }, 
                { $addToSet: { savedBooks: bookData } },
                { new: true, runValidators: true }
                );
            if (!updatedUser) {
                throw new AuthenticationError('You need to be logged in!');
            }
            return updatedUser;
        },
        removeBook: async (parent, {bookId}, context) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: {bookId: bookId} } },
                { new: true }
            );
            if (!updatedUser) {
                throw new AuthenticationError('You need to be logged in!');
            }
        }
    }
}

module.exports = resolvers;