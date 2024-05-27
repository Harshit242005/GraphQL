import { gql } from "@apollo/client";

export const CREATE_LEARNING = gql`
mutation CreateLearning($name: String!) {
    createLearning(name: $name) {
        id,
        name,
    }
}
`

export const DELETE_LEARNING = gql`
mutation DeleteLearning($learningName: String!) {
    deleteLearning(name: $learningName) {
        
    }
}
`

export const CREATE_FILE = gql`
mutation CreateFile($learningName: String!, $fileName: String!, $fileContent: String!) {
    createFile(learningName: $learningName, name: $fileName, content: $fileContent) {
        id,
        name,
        learningName,
        content
    }
}
`
