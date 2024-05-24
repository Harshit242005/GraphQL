// src/App.jsx
// navigation page for the site 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import  Home  from './Component/Home';
import Files from './Component/Files';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/Files/:learningName' element={<Files />}/>
      </Routes>
    </Router>
  );
}

export default App;
