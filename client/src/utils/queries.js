// query the me query set up using Apollo Server's context object
import { gql } from '@apollo/client';

export const GET_ME = gql `
    query me {
        me {
            _id: ID
            username: String
            email: String
            bookCount: Int
            savedBooks: [Book]
        }
    }
`