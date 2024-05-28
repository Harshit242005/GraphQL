import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Neo4jGraphQL } from '@neo4j/graphql';
import * as neo4j from 'neo4j-driver';

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '1q2w3e4r5t6y'));


// define both the tydef and resolvers 
const typeDefs = `#graphql


type Learning {
  id: ID!
  name: String!
  files: [File!]! @relationship(type: "BelongsTo", direction: OUT)
}

type File {
  id: ID!
  name: String!
  learningName: Learning @relationship(type: "BelongsTo", direction: IN) #  this should hold the learning name with which this file is associated to 
  content: String #  content of the file 
}

type Query {
  # query related to learnings 
  getAllLearning: [Learning]
  getLearningByName(name: String!): Learning

  # queries related to the files
  getAllFiles(learningName: String!): [File]
  getFileByName(fileName: String!, learningName: String!): File   # would need file name and learning name also

}

type Mutation {

  # create learning 
  createLearning(name: String!): Learning!

  # create file 
  createFile(learningName: String!, name: String!, content: String): File!

  # mutation for updating the content of the files also 
  updateFile(learningName: String!, fileName: String!, content: String!): File

  # delete the learing with the name
  deleteLearning(learningName: String!): Boolean


  # delete the file 
  deleteFile(learningName: String!, fileName: String!): File


}
`

const resolvers = {

  Query: {


    getAllLearning: async () => {
      const session = driver.session();
      try {
        const result = await session.run('MATCH (l:Learning) RETURN l');
        if (result.records.length === 0) {
          console.log('No records found');
        }
        return result.records.map(record => {
          const node = record.get('l');
          return {
            id: node.identity.toString(), // Using Neo4j internal ID as string
            name: node.properties.name,
          };
        });
      } finally {
        await session.close();
      }
    },

    getAllFiles: async (parent, { learningName }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (l:Learning {name: $learningName})<-[:BelongsTo]-(f:File) RETURN f',
          { learningName }
        );

        console.log(`all files query result is: ${result}`);
        // Extracting properties of files from the result
        const files = result.records.map(record => {
          const file = record.get('f').properties;
          // Include learningName in the file properties
          file.id = record.get('f').identity.toString(); // Ensure ID is included
          file.learningName = learningName;
          return file;
        });
        console.log(files);
        return files;
      } finally {
        await session.close();
      }
    },


    getLearningByName: async (parent, { name }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (l:Learning { name: $name }) RETURN l',
          { name }
        );
        if (result.records.length === 0) {
          return { id: '', name: '', files: [] }; // Return an empty Learning object
        }
        // Extract the name property from the first record
        return result.records[0].get('l').properties;
      } finally {
        await session.close();
      }
    },



    getFileByName: async (parent, { fileName }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (f:File {name: $fileName}) RETURN f',
          { fileName }
        );
        if (result.records.length === 0) {
          return { id: '', name: '', learningName: '', content: '' }; // Return an empty Learning object
        }
        console.log(result.records[0].get('f').properties);
        return {
          id: result.records[0].get('f').properties.id.toString(),
          content: result.records[0].get('f').properties.content
        }
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
          `
          CREATE (l:Learning {name: $name})
          CREATE (f:File {name: "Basic", content: "This is a basic file created for the " + $name})
          MERGE (f)-[:BelongsTo]->(l)
          RETURN l, f
          `,
          { name }
        );

        const createdLearningNode = result.records[0].get('l');
        const createdFileNode = result.records[0].get('f');

        const returnResult = {
          id: createdLearningNode.identity.toString(),
          name: createdLearningNode.properties.name,
          files: [
            {
              id: createdFileNode.identity.toString(),
              name: createdFileNode.properties.name,
              content: createdFileNode.properties.content,
            },
          ],
        };

        console.log(`Learning after creation: ${returnResult}`);
        return returnResult;
      } finally {
        await session.close();
      }
    },


    // Mutation for creating the file
    createFile: async (parent, { learningName, name, content }) => {
      console.log('executing');
      const session = driver.session();
      try {
        // Create the file node and establish the relationship with the learning
        const result = await session.run(
          'MATCH (l:Learning {name: $learningName}) ' +
          'CREATE (f:File {name: $name, content: $content})-[:BelongsTo]->(l) ' +
          'RETURN f',
          { learningName, name, content }
        );
        // Extract the created file node from the result
        const createdFile = result.records[0].get('f');
        console.log(`create file return ${createdFile}`);
        // Return the properties of the created file
        return {
          id: createdFile.identity.toString(),
          name: createdFile.properties.name,
          learningName: learningName, // Return the learning name as provided
          content: createdFile.properties.content
        };
      } finally {
        await session.close();
      }
    },



    // delete the learning from this mutation
    deleteLearning: async (parent, { name }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `
          MATCH (l:Learning {name: $name})<-[r:BelongsTo]-(f:File)
      DETACH DELETE l, f
          `,
          { name }
        );

        // Check the summary of the operation to see how many nodes were deleted
        const nodesDeleted = result.summary.counters.updates().nodesDeleted;

        // Return true if nodes were deleted, false otherwise
        return nodesDeleted > 0;
      } finally {
        await session.close();
      }
    },


    deleteFile: async (parent, { learningName, fileName }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (l:Learning{name: learnmingName})-[r:BelongsTo]->(f:File{name: fileName})' +
          'DETACH DELETE f' +
          'RETURN l, f',
          { learningName, fileName }
        );
        console.log(`After deleting the file: ${result}`);
        return { name: fileName };
      } finally {
        await session.close();
      }
    },



    // update the file with the learning name 
    updateFile: async (parent, { learningName, fileName, fileText }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          'MATCH (l:Learning {name: $learningName})-[:BelongsTo]->(f:File {name: $fileName}) ' +
          'SET f.content = $fileText ' +
          'RETURN f',
          { learningName, fileName, fileText }
        );
        if (result.records.length === 0) {
          throw new Error('File not found or update failed');
        }
        const updatedFile = result.records[0].get('f').properties;
        console.log(`After updating the file: ${updatedFile}`);
        return {
          name: updatedFile.name,
          content: updatedFile.content,
        };
      } finally {
        await session.close();
      }
    }
  },


};


// Create an instance of Neo4jGraphQL
const neoSchema = new Neo4jGraphQL({
  typeDefs, driver, resolvers
});

// Create an Apollo Server instance
const server = new ApolloServer({
  schema: await neoSchema.getSchema(), // Note the use of getSchema() method to get the processed schema
});

// Start the server
const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
  });
  console.log(`🚀 Server ready at ${url}`);
};

startServer();


