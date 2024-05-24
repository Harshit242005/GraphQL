import { gql } from '@apollo/client';

export const GET_ALL_LEARNING = gql`
query GetAllLearning {
    getAllLearning {
        id,
        name
    }
}
`

export const GET_ALL_FILES = gql`
  query GetAllFiles($learningName: String!) {
    getAllFiles(learningName: $learningName) {
      id
      name
      content
      learningName
    }
  }
`;