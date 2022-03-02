const { User } = require('../models');
const { signToken } = require('../utils/auth')
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        me: async (parent, context) => {
            if (context.user) {
              return User.findOne({ _id: context.user._id }).select('-___v -password')
            }
            throw new AuthenticationError('You need to be logged in!');
          },
      },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
          const user = await User.create({ username, email, password });
          const token = signToken(user);
          return { token, user };
        },

        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
      
            if (!user) {
              throw new AuthenticationError('No user found with this email address');
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
      
            const token = signToken(user);
      
            return { token, user };
          },

      addBook: async (parent, { bookData }, context) => {
        if (context.user) {
       const book = await User.findByIdAndUpdate(
          { _id: context.user._id },
          {$addToSet: { savedBooks: bookData } },
          { new: true }
        );
        return book;
        }
        throw new AuthenticationError('You need to be logged in!');
      },
    

    removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
         const book = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: bookId } }
          );
          return book;
        }
        throw new AuthenticationError('You need to be logged in!');
      },
    },
}
  
  module.exports = resolvers;