import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import * as neo4j from 'neo4j-driver';

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'aszxcvbnm'));


// define both the tydef and resolvers 
const typeDefs = `#graphql


type Learning {
  id: ID!
  name: String!
  files: [File]
}

type File {
  id: ID!
  name: String!
  learningName: String! #  this should hold the learning name with which this file is associated to 
  content: String #  content of the file 
}

type Query {
  getAllLearning: [Learning]
  getLearningById(id: ID!): Learning
  getAllFiles(id: ID!): [File]
  getFileById(learningId: ID!, fileId: ID!): File
}

type Mutation {
  # create learning 
  createLearning(name: String!): Learning!
  # create file 
  createFile(learningName: String!, name: String!, content: String!): File!
  # mutation for updating the content of the files also 
  updateFile(learningId: ID!, fileId: ID!, content: String!): File!
  # delete the learing with the id 
  deleteLearning(learningId: ID!): Learning!
  # delete the file 
  deleteFile(learningId: ID!, fileId: ID!): File!
}



`

const resolvers = {
  Query: {


    getAllLearning: async (parent, args) => {
      const session = driver.session();
      try {
        const result = await session.run('MATCH (l:Learning) RETURN l');
        return result.records.map(record => ({
          id: record.get('l').properties.id,
          name: record.get('l').properties.name,
          files: record.get('l').properties.files
        }));
      } finally {
        await session.close();
      }
    },


    getAllFiles: async (parent, { learningId }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (l:Learning)-[:HAS_FILE]->(f:File) WHERE l.id = $learningId RETURN f',
          { learningId }
        );
        return result.records.map(record => record.get('f').properties);
      } finally {
        await session.close();
      }
    },

    getLearningById: async (parent, { learningId }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (l:Learning { id: $learningId }) RETURN l',
          { learningId }
        );
        return result.records.map(record => record.get('l').properties);
      } finally {
        await session.close();
      }
    },

    getFileById: async (parent, { learningId, fileId }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (l:Learning { id: $learningId })-[:HAS_FILE]->(f:File { id: $fileId }) RETURN f',
          { learningId, fileId }
        );
        return result.records.map(record => record.get('f').properties);
      } finally {
        await session.close();
      }
    },





  },


  Mutation: {
    createLearning: async (parent, { name }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'CREATE (l:Learning {name: $name}) RETURN l',
          { name }
        );
        return {
          id: result.records[0].get('l').properties.id,
          name: result.records[0].get('l').properties.name,
        };
      } finally {
        await session.close();
      }
    },

    // create file 
    createFile: async (parent, { learningName, name, content }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (l:Learning {name: $learningName}) ' +
          'CREATE (f:File {name: $name, content: $content, learningName: $learningName})-[:BELONGS_TO]->(l) ' +
          'RETURN f',
          { learningName, name, content }
        );

        // Check if any records were returned
        if (result.records.length > 0) {
          // Get the properties of the first record
          const fileProperties = result.records[0].get('f').properties;
          return {
            id: fileProperties.id,
            name: fileProperties.name,
            learningName: fileProperties.learningName,
            content: fileProperties.content,
          };
        } else {
          throw new Error('No records found'); // Throw an error if no records are found
        }
      } finally {
        await session.close();
      }
    },



    // delete learning  
    deleteLearning: async (parent, { learningId }) => {
      const session = driver.session();
      try {
        // Delete the learning node and its associated files
        const result = await session.run(
          'MATCH (l:Learning {id: $learningId}) ' +
          'DETACH DELETE l',
          { learningId }
        );
        console.log(`result after deleting the learning: ${result}`);
        // Return the deleted learning ID to confirm deletion
        return { id: learningId };
      } finally {
        await session.close();
      }
    },

    deleteFile: async (parent, { learningId, fileId }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (l:Learning { id: $learningId }) ' +
          'MATCH (f:File { id: $fileId }) ' +
          'DETACH DELETE f ' +
          'RETURN l',
          { learningId, fileId }
        );
        console.log(`After deleting the file: ${result}`);
        return { id: fileId };
      } finally {
        await session.close();
      }
    },

    // mutation for updating the file content 
    updateFile: async (parent, { learningId, fileId, fileText }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (l:Learning { id: $learningId }) ' +
          'MATCH (f:File { id: $fileId }) ' +
          'SET f.content = $fileText ' +
          'RETURN f',
          { learningId, fileId, fileText }
        );
        console.log(`After updating the file: ${result}`);
        return { id: fileId };
      } finally {
        await session.close();
      }
    },


  },
};



const server = new ApolloServer({
  typeDefs,
  resolvers,
});



const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);