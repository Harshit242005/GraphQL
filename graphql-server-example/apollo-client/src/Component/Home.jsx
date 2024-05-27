
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_LEARNING } from '../apollo-server/queries';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { CREATE_LEARNING } from '../apollo-server/mutation';


function Home() {
    const navigate = useNavigate();
    // eslint-disable-next-line no-unused-vars
    const { loading, error, data } = useQuery(GET_ALL_LEARNING);

    // if (loading) return <p>Loading</p>;
    // if (error) return <p>Found an error in loading {error.message}</p>

    const selectedLearning = (learningName) => {
        navigate(`/Files/${learningName}`);
    }

    // create learning for the mutation 
    // Define the createLearning mutation
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [createLearning] = useMutation(CREATE_LEARNING, {
        // Update cache after mutation
        update(cache, { data: { createLearning } }) {
            // Read existing data from cache
            const { getAllLearning } = cache.readQuery({ query: GET_ALL_LEARNING });
            // Write new data to cache
            cache.writeQuery({
                query: GET_ALL_LEARNING,
                data: { getAllLearning: [...getAllLearning, createLearning] },
            });
        }
    });


    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [newLearningName, setNewLearningName] = useState('');

    const handleCreateLearning = async () => {

        try {
            // Call the createLearning mutation
            await createLearning({
                variables: { name: newLearningName },
            });
            // Clear the input field after successful mutation
            setNewLearningName('');
        } catch (error) {
            console.error('Error creating learning:', error);
        }
    }


    return (
        <div>
            <div>
                {data && data.getAllLearning.map((learning) => (
                    <div key={learning.id}>
                        <button onClick={() => selectedLearning(learning.name)}>{learning.name}</button>
                    </div>
                ))}
            </div>
           
                <div>
                    <input type="text" value={newLearningName} onChange={(e) => setNewLearningName(e.target.value)} />
                    <button onClick={handleCreateLearning}>Create Learning</button>
                </div>
          
          
        </div>
    )
}
export default Home;
