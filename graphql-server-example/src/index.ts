// import { ApolloServer } from '@apollo/server';
// import { startStandaloneServer } from '@apollo/server/standalone';
// import { Neo4jGraphQL } from '@neo4j/graphql';
// import * as neo4j from 'neo4j-driver';

// const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'aszxcvbnm'));


// // define both the tydef and resolvers 
// const typeDefs = `#graphql


// type Learning {
//   id: ID!
//   name: String!
//   files: [File!]! @relationship(type: "BelongsTo", direction: IN)
// }

// type File {
//   id: ID!
//   name: String!
//   learningName: Learning @relationship(type: "BelongsTo", direction: OUT) #  this should hold the learning name with which this file is associated to 
//   content: String #  content of the file 
// }

// type Query {
//   # query related to learnings 
//   getAllLearning: [Learning]
//   getLearningByName(name: String!): Learning

//   # queries related to the files
//   getAllFiles(learningName: String!): [File]
//   getFileByName(fileName: String!, learningName: String!): File   # would need file name and learning name also

// }

// type Mutation {

//   # create learning 
//   createLearning(name: String!): Learning!

//   # create file 
//   createFile(learningName: String!, name: String!, content: String): File!

//   # mutation for updating the content of the files also 
//   updateFile(learningName: String!, fileName: String!, content: String!): File

//   # delete the learing with the name
//   deleteLearning(learningName: String!): Learning!


//   # delete the file 
//   deleteFile(learningName: String!, fileName: String!): File


// }
// `

// // const resolvers = {

// //   Query: {


// //     getAllLearning: async () => {
// //       const session = driver.session();
// //       try {
// //         const result = await session.run('MATCH (l:Learning) RETURN l');
// //         if (result.records.length === 0) {
// //           console.log('No records found');
// //         }
// //         return result.records.map(record => {
// //           const node = record.get('l');
// //           return {
// //             id: node.identity.toString(), // Using Neo4j internal ID as string
// //             name: node.properties.name,
// //           };
// //         });
// //       } finally {
// //         await session.close();
// //       }
// //     },


// //     // getAllFiles: async (parent, { learningName }) => {
// //     //   const session = driver.session();
// //     //   try {
// //     //     const result = await session.run(
// //     //       'MATCH (f:File { learningName:  $learningName RETURN f})',
// //     //       { learningName }
// //     //     );
// //     //     const names = result.records.map(record => record.get('f').properties);
// //     //     console.log(names);

// //     //   } finally {
// //     //     await session.close();
// //     //   }
// //     // },


// //     getAllFiles: async (parent, { learningName }) => {
// //       const session = driver.session();
// //       try {
// //         const result = await session.run(
// //           'MATCH (l:Learning {name: $learningName})-[:BelongsTo]->(f:File) RETURN f',
// //           { learningName }
// //         );
// //         // Extracting properties of files from the result
// //         const files = result.records.map(record => {
// //           const file = record.get('f').properties;
// //           // Include learningName in the file properties
// //           file.learningName = learningName;
// //           return file;
// //         });
// //         console.log(files);
// //         return files;
// //       } finally {
// //         await session.close();
// //       }
// //     },

// //     getLearningByName: async (parent, { name }) => {
// //       const session = driver.session();
// //       try {
// //         const result = await session.run(
// //           'MATCH (l:Learning { name: $name }) RETURN l',
// //           { name }
// //         );
// //         if (result.records.length === 0) {
// //           return { id: '', name: '', files: [] }; // Return an empty Learning object
// //         }
// //         // Extract the name property from the first record
// //         return result.records[0].get('l').properties;
// //       } finally {
// //         await session.close();
// //       }
// //     },



// //     getFileByName: async (parent, { fileName }) => {
// //       const session = driver.session();
// //       try {
// //         const result = await session.run(
// //           'MATCH (f:File {name: $fileName}) RETURN f',
// //           { fileName }
// //         );
// //         if (result.records.length === 0) {
// //           return { id: '', name: '', learningName: '', content: '' }; // Return an empty Learning object
// //         }
// //         console.log(result.records[0].get('f').properties);
// //         return result.records[0].get('f').properties;
// //       } finally {
// //         await session.close();
// //       }
// //     },





// //   },


// //   Mutation: {

// //     createLearning: async (parent, { name }) => {
// //       const session = driver.session();
// //       try {
// //         const result = await session.run(
// //           'CREATE (l:Learning {name: $name}) RETURN l',
// //           { name }
// //         );
// //         const createdNode = result.records[0].get('l');
// //         const returnResult = {
// //           id: createdNode.identity.toString(),
// //           name: createdNode.properties.name,
// //         };
// //         console.log(`learning after creation is: ${returnResult}`);
// //         return returnResult;
// //       } finally {
// //         await session.close();
// //       }

// //     },

// //     createFile: async (parent, { learningName, name, content }) => {
// //       const session = driver.session();
// //       try {
// //         // Create the file node and establish the relationship with the learning
// //         const result = await session.run(
// //           'MATCH (l:Learning {name: $learningName}) ' +
// //           'CREATE (f:File {name: $name, content: $content})-[:BelongsTo]->(l) ' +
// //           'RETURN f',
// //           { learningName, name, content }
// //         );
// //         // Extract the created file node from the result
// //         const createdFile = result.records[0].get('f');
// //         // Return the properties of the created file
// //         return {
// //           id: createdFile.identity.toString(),
// //           name: createdFile.properties.name,
// //           learningName: learningName, // Return the learning name as provided
// //           content: createdFile.properties.content
// //         };
// //       } finally {
// //         await session.close();
// //       }
// //     },

// //     // create file 
// //     // createFile: async (parent, { learningName, name, content }) => {
// //     //   const session = driver.session();
// //     //   try {
// //     //     const result = await session.run(
// //     //       'MATCH (l:Learning {name: $learningName}) ' +
// //     //       'CREATE (f:File {name: $name, content: $content, learningName: $learningName}) ' +
// //     //       'WITH l, f ' +
// //     //       'SET l.files = COALESCE(l.files, []) + $name ' + // Append the new file name to the list
// //     //       'RETURN f',
// //     //       { learningName, name, content }
// //     //     );

// //     //     // Check if any records were returned
// //     //     if (result.records.length > 0) {
// //     //       // Get the properties of the first record
// //     //       const fileProperties = result.records[0].get('f').properties;
// //     //       return {
// //     //         id: fileProperties.id,
// //     //         name: fileProperties.name,
// //     //         learningName: fileProperties.learningName,
// //     //         content: fileProperties.content,
// //     //       };
// //     //     } else {
// //     //       throw new Error('No records found'); // Throw an error if no records are found
// //     //     }
// //     //   } finally {
// //     //     await session.close();
// //     //   }
// //     // },





// //     // delete learning  
// //     deleteLearning: async (parent, { learningId }) => {
// //       const session = driver.session();
// //       try {
// //         // Delete the learning node and its associated files
// //         const result = await session.run(
// //           'MATCH (l:Learning {id: $learningId}) ' +
// //           'DETACH DELETE l',
// //           { learningId }
// //         );
// //         console.log(`result after deleting the learning: ${result}`);
// //         // Return the deleted learning ID to confirm deletion
// //         return { id: learningId };
// //       } finally {
// //         await session.close();
// //       }
// //     },

// //     deleteFile: async (parent, { learningName, fileName }) => {
// //       const session = driver.session();
// //       try {
// //         const result = await session.run(
// //           'MATCH (l:Learning{name: learnmingName})-[r:BelongsTo]->(f:File{name: fileName})' +
// //           'DETACH DELETE f' +
// //           'RETURN l, f',
// //           { learningName, fileName }
// //         );
// //         console.log(`After deleting the file: ${result}`);
// //         return { name: fileName };
// //       } finally {
// //         await session.close();
// //       }
// //     },

// //     // mutation for updating the file content 
// //     // updateFile: async (parent, { learningName, fileName, fileText }) => {
// //     //   const session = driver.session();
// //     //   try {
// //     //     const result = await session.run(
// //     //       'MATCH (l:Learning{name: $learningName})-[:Belongs_To]->(f:File{name: $fileName})' +
// //     //       'SET f = {content: $fileText}' +
// //     //        'return f',
// //     //       { learningName, fileName, fileText }
// //     //     );
// //     //     console.log(`After updating the file: ${result}`);
// //     //     return { name: fileName };
// //     //   } finally {
// //     //     await session.close();
// //     //   }
// //     // },

// //     updateFile: async (parent, { learningName, fileName, fileText }) => {
// //       const session = driver.session();
// //       try {
// //         const result = await session.run(
// //           'MATCH (l:Learning {name: $learningName})-[:BelongsTo]->(f:File {name: $fileName}) ' +
// //           'SET f.content = $fileText ' +
// //           'RETURN f',
// //           { learningName, fileName, fileText }
// //         );
// //         if (result.records.length === 0) {
// //           throw new Error('File not found or update failed');
// //         }
// //         const updatedFile = result.records[0].get('f').properties;
// //         console.log(`After updating the file: ${updatedFile}`);
// //         return {
// //           name: updatedFile.name,
// //           content: updatedFile.content,
// //         };
// //       } finally {
// //         await session.close();
// //       }
// //     }



// //   },
// // };


// // Create an instance of Neo4jGraphQL
// const neoSchema = new Neo4jGraphQL({
//   typeDefs, driver, resolvers: {
//     Mutation: {
//       createLearning: async (_, { name }, { driver }) => {
//         const session = driver.session();
//         try {
//           const result = await session.run(
//             'CREATE (l:Learning {name: $name}) RETURN l',
//             { name }
//           );
//           return result.records[0].get('l').properties;
//         } finally {
//           await session.close();
//         }
//       },
//     }
//   }
// });

// // Create an Apollo Server instance
// const server = new ApolloServer({
//   schema: await neoSchema.getSchema(), // Note the use of getSchema() method to get the processed schema
// });

// // Start the server
// const startServer = async () => {
//   const { url } = await startStandaloneServer(server, {
//     listen: { port: 4000 }
//   });
//   console.log(`🚀 Server ready at ${url}`);
// };

// startServer();



// // const server = new ApolloServer({
// //   typeDefs,
// //   resolvers,
// // });



// // const { url } = await startStandaloneServer(server, {
// //   listen: { port: 4000 },
// // });

// // console.log(`🚀  Server ready at: ${url}`);



import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Neo4jGraphQL } from '@neo4j/graphql';
import neo4j from 'neo4j-driver';

// Create a Neo4j driver instance
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'aszxcvbnm'));

// Define your GraphQL schema
const typeDefs = `#graphql
type Learning {
  id: ID!
  name: String!
  files: [File!]! @relationship(type: "BelongsTo", direction: IN)
}

type File {
  id: ID!
  name: String!
  learningName: Learning @relationship(type: "BelongsTo", direction: OUT)
  content: String
}

type Query {
  getAllLearning: [Learning]
  getAllFiles(learningName: String!): [File]
}

type Mutation {
  createLearning(name: String!, fileName: String!, fileContent: String!): Learning!
  createFile(learningName: String!, name: String!, content: String): File!
  updateFile(learningName: String!, fileName: String!, content: String!): File!
  deleteLearning(id: ID!): Learning!
  deleteFile(learningName: String!, fileName: String!): File!
}
`;

// Create an instance of Neo4jGraphQL with custom resolvers
const neoSchema = new Neo4jGraphQL({
  typeDefs,
  driver,
  resolvers: {
    Mutation: {
      createLearning: async (_, { name, fileName, fileContent }, { driver }) => {
        const session = driver.session();
        try {
          const result = await session.run(
            `CREATE (l:Learning {name: $name})-[:BelongsTo]->(f:File {name: $fileName, content: $fileContent})
             RETURN l, f`,
            { name, fileName, fileContent }
          );
          const learningNode = result.records[0].get('l').properties;
          return learningNode;
        } finally {
          await session.close();
        }
      },
      createFile: async (_, { learningName, name, content }, { driver }) => {
        const session = driver.session();
        try {
          const result = await session.run(
            `MATCH (l:Learning {name: $learningName})
             CREATE (f:File {name: $name, content: $content})-[:BelongsTo]->(l)
             RETURN f`,
            { learningName, name, content }
          );
          return result.records[0].get('f').properties;
        } finally {
          await session.close();
        }
      },
      updateFile: async (_, { learningName, fileName, content }, { driver }) => {
        const session = driver.session();
        try {
          const result = await session.run(
            `MATCH (:Learning {name: $learningName})-[:BelongsTo]->(f:File {name: $fileName})
             SET f.content = $content
             RETURN f`,
            { learningName, fileName, content }
          );
          return result.records[0].get('f').properties;
        } finally {
          await session.close();
        }
      },
      deleteLearning: async (_, { id }, { driver }) => {
        const session = driver.session();
        try {
          const result = await session.run(
            'MATCH (l:Learning {id: $id}) DETACH DELETE l RETURN l',
            { id }
          );
          return result.records[0].get('l').properties;
        } finally {
          await session.close();
        }
      },
      deleteFile: async (_, { learningName, fileName }, { driver }) => {
        const session = driver.session();
        try {
          const result = await session.run(
            `MATCH (:Learning {name: $learningName})-[:BelongsTo]->(f:File {name: $fileName})
             DETACH DELETE f
             RETURN f`,
            { learningName, fileName }
          );
          return result.records[0].get('f').properties;
        } finally {
          await session.close();
        }
      }
    }
  }
});

// Create an Apollo Server instance
const server = new ApolloServer({
  schema: await neoSchema.getSchema(),
});

// Start the server
const startServer = async () => {
  const { url } = await startStandaloneServer(server);
  console.log(`🚀 Server ready at ${url}`);
};

startServer();
