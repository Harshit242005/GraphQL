import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
const typeDefs = `#graphql
 
  type Book {
    title: String
    author: String
  }

  # writing the first mutation
  type Mutation {
    createAuthor(title: String!, author: String!): Book
  }

  
  type Query {
    books: [Book]
    getAuthors: [String]
  }
`;
const books = [
    {
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        title: 'City of Glass',
        author: 'Paul Auster',
    },
];
const resolvers = {
    Query: {
        books: () => books,
        // writing an another resolver query to get the auth names
        // getAuthor: () => {
        //     books['author']
        // }
        getAuthors: () => books.map(book => book.author),
    },
    // define the mutation functions
    Mutation: {
        createAuthor: (parent, args) => {
            const { title, author } = args; // Destructure input arguments
            // Create a new author object
            const newAuthor = { title, author };
            // Add the new author to the books array
            books.push(newAuthor);
            // Return the created author
            return newAuthor;
        }
    }
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at: ${url}`);
