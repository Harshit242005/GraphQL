import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { GET_ALL_FILES, GET_ALL_LEARNING } from "../apollo-server/queries";
import { CREATE_FILE, DELETE_LEARNING } from "../apollo-server/mutation";

function Files() {
  const { learningName } = useParams();
  const navigate = useNavigate();

  // Hooks should be called at the top level
  const { loading, error, data } = useQuery(GET_ALL_FILES, {
    variables: { learningName }
  });

  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');

  const [createFile] = useMutation(CREATE_FILE, {
    update(cache, { data: { createFile } }) {
      // Read existing data from cache
      const { getAllFiles } = cache.readQuery({ query: GET_ALL_FILES, variables: { learningName } });
      // Write new data to cache
      cache.writeQuery({
        query: GET_ALL_FILES,
        variables: { learningName },
        data: { getAllFiles: [...getAllFiles, createFile] },
      });
    }
  });

  const [deleteLearningQuery] = useMutation(DELETE_LEARNING, {
    update(cache, { data: { deleteLearning } }) {
      const { getAllLearning } = cache.readQuery({ query: GET_ALL_LEARNING });
      cache.writeQuery({
        query: GET_ALL_LEARNING,
        data: { getAllLearning: getAllLearning.filter(learning => learning.name !== learningName) }
      });
    }
  });

  const createFileForLearning = async () => {
    try {
      await createFile({
        variables: { learningName, name: fileName, content: fileContent }
      });
      setFileName('');
      setFileContent('');
    } catch (error) {
      console.log(`We faced an error while creating a file: ${error}`);
    }
  }

  const deleteLearning = async () => {
    try {
      await deleteLearningQuery({ variables: { name: learningName } });
      navigate('/');
    } catch (error) {
      console.log(`Error deleting the learning: ${error}`);
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>There is an error loading the files: {error.message}</p>

  const showContent = (fileName) => {
    navigate(`/Content/${learningName}/${fileName}`);
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
      <input onChange={(e) => setFileName(e.target.value)} value={fileName} />
      <textarea value={fileContent} onChange={(e) => setFileContent(e.target.value)}></textarea>
      <button onClick={createFileForLearning}>Create</button>
    </div>
  )
}

export default Files;
