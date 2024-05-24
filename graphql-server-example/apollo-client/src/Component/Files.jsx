import { useParams } from "react-router-dom";
import { GET_ALL_FILES } from "../apollo-server/queries";
import { useQuery } from "@apollo/client";

function Files() {
    const { learningName } = useParams();


    const { loading, error, data } = useQuery(GET_ALL_FILES, {
        variables: { learningName }
    });

    if (loading) return <p>Loading...</p>
    if (error) return <p>There is an error loading the files {error.message}</p>




    return (
        <div>
            <h2>Learning Name: {learningName}</h2>
            <ul>
                {data.getAllFiles.map(file => (
                    <li key={file.id}>
                        <button>Name: {file.name}</button>

                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Files