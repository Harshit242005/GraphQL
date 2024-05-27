/* eslint-disable react-hooks/rules-of-hooks */
import { useParams } from "react-router-dom";
import { GET_ALL_FILES, GET_ALL_LEARNING } from "../apollo-server/queries";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { CREATE_FILE, DELETE_LEARNING } from "../apollo-server/mutation";
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

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [fileName, setFileName] = useState('');
    const [fileContent, setFileContent] = useState('');

    const  showContent = (fileName) => {
        navigate(`/Content/${learningName}/${fileName}`);
    }

    // // creating a mutation 
    // // eslint-disable-next-line react-hooks/rules-of-hooks
    // const [createFile] = useMutation(CREATE_FILE, {
    //     // eslint-disable-next-line no-unused-vars
    //     update(cache, {data: {createFile}}) {
    //          // Read existing data from cache
    //          const { getAllFiles } = cache.readQuery({ query: GET_ALL_FILES, variables: {learningName } });
    //          // Write new data to cache
    //          cache.writeQuery({
    //              query: GET_ALL_FILES,
    //              variables: learningName,
    //              data: { getAllFiles: [...getAllFiles, createFile] },
    //          });
    //     }
    // });

    // const createFileForLearning = async () => {
    //     try {
    //         await createFile({
    //             variables: {learningName, fileName, fileContent}
    //         });

    //         // revoked the file name and content
    //         setFileName('');
    //         setFileContent('');
    //     }
    //     catch (error) {
    //         console.log(`we have faced an error while creating a file; ${error}`)
    //     }
    // }


   
        // this function would drop all the relations and drop the learning name 
        const [deleteLearningQuery] = useMutation(DELETE_LEARNING, {
            update(cache, {data: {deleteLearning}}) {
                const {getAllLearning} = cache.readQuery({query: GET_ALL_LEARNING});

                cache.writeQuery({
                    query: GET_ALL_LEARNING,
                    data: {getAllLearning: [...getAllLearning, deleteLearning]}
                })
            } 
        })
        const deleteLearning = async () => { 
            try {
                await deleteLearningQuery({variables: {learningName}});
                navigate('/'); 
            }

            catch (error) {
                console.log(`error deleting the learning; ${error}`);
            }
        }


    return (
        <div>
            <button onClick={deleteLearning}>Delete learning</button>
            <h2>Learning Name: {learningName}</h2>
            <div>
                {data.getAllFiles.map((file) => (
                    <div key={file.id}>
                        <button onClick={() => showContent(file.name)}>{file.name}</button>
                    </div>
                ))}
            </div>
            {/* <input onChange={(e) => setFileName(e.target.value)} value={fileName} />
            <textarea value={fileContent} onChange={(e) => setFileContent(e.target.value)}></textarea>
            <button onClick={createFileForLearning}>create</button> */}
        </div>
    )
}

export default Files