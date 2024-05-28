import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_FILE_BY_NAME } from "../apollo-server/queries";

function Content() {
    const { learningName, fileName } = useParams();
    console.log(learningName, fileName);

    const { loading, error, data } = useQuery(GET_FILE_BY_NAME, {
        variables: { fileName }
    });

    if (loading) return <p>Loading...</p>
    if (error) return <p>Not been able to fetch the content of the file {error.message}</p>

    console.log(data);

    return (
        <div>
            <p>Content for the file {fileName} of the {learningName}</p>
            <p>{data.getFileByName.content}</p>
        </div>
    )
}

export default Content;
