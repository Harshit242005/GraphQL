import React from 'react'
import {useParams} from 'react-router-dom';
import {useQuery} from '@apollo/client';
import { GET_FILE_BY_NAME } from "../apollo-server/queries";


function Content() {
    const [loading, error, data] = useQuery(GET_FILE_BY_NAME, {variable: fileName});
    if (loading) return <p>Loading...</p>
    if(error) return  <p>Not been able to fetch the content of the file {error.message}</p>
    
    console.log(data);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {learningName, fileName} = useParams();
    console.log(learningName, fileName);


  return (
    <div>
        <p>Content for the file {fileName} of the {learningName}</p>
        <p>{data.getFileByName.content}</p>
    </div>
  )
}

export default Content