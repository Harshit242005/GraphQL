import { useParams } from "react-router-dom";
import { GET_ALL_FILES } from "../apollo-server/queries";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
function Files() {
    const { learningName } = useParams();
    console.log(learningName);
    const navigate = useNavigate();
    const { loading, error, data } = useQuery(GET_ALL_FILES, {
        variables: { learningName }
    });

    console.log(data);

    if (loading) return <p>Loading...</p>
    if (error) return <p>There is an error loading the files {error.message}</p>

    const  showContent = (fileName) => {
        navigate(`/Content/${learningName}/${fileName}`);
    }


    return (
        <div>

            <h2>Learning Name: {learningName}</h2>
            <div>
                {data.getAllFiles.map((file) => (
                    <div key={file.id}>
                        <button onClick={showContent(file.name)}>{file.name}</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Files