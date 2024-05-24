import { gql } from "@apollo/client";

export const CREATE_LEARNING = gql`
mutation CreateLearning($name: String!) {
    createLearning(name: $name) {
        id,
        name,
    }
}
`