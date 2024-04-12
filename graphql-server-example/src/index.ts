import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import * as neo4j from 'neo4j-driver';

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'aszxcvbnm'));
// define both the tydef and resolvers 
const typeDefs = `#graphql

type Person {
  name: String!
  age: Int!
}

type Query {
  persons: [Person!]!
}

type Mutation {
  createPerson(name: String!, age: Int!): Person
}

`

const resolvers = {
  Query: {
    persons: async () => {
      const session = driver.session(); //  creating the session
      try {
        const result = await session.run('MATCH (p:Person) RETURN p');
        return result.records.map(record => record.get('p').properties);
      } finally {
        session.close();
      }
    }
  },

  Mutation: {
    createPerson: async (parent, args) => {
      const {name, age} = args;
      const session = driver.session();
      try {
        const result = await session.run('CREATE (p:Person {name: $name, age: $age}) RETURN p', { name: name, age: age });
        return result.records[0].get('p').properties;
      } finally {
        session.close();
      }
    }
  }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
});



const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);





// // Define a function to add data to the database
// const addData = async () => {
//   let session;

//   try {
//       // Create a session
//       session = driver.session();

//       // Run a Cypher query to add data
//       const result = await session.run(
//           'CREATE (p:Person {name: $name, age: $age}) RETURN p',
//           { name: 'John', age: 30 }
//       );

//       // Log the result
//       console.log('Data added successfully:', result.records[0].get('p').properties);
//   } catch (error) {
//       console.error('Failed to add data:', error);
//   } finally {
//       // Close the session
//       if (session) {
//           session.close();
//       }
//   }
// };

// addData();