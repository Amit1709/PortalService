import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AddCategory from './Components/AddCategory';
import SubCategoryForm from './Components/SubCategoryForm';
import AdditionalDetailsForm from './Components/AdditionalDetails';
import AddReferenceDataForm from './Components/AddReferenceData';
import Header from './Header';  // Import the Header component from outside the Components folder

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                <Header />  {/* Include the Header component */}
                <Routes>
                    <Route path="/" element={<Navigate replace to="/add-category" />} />
                    <Route path="/add-category" element={<AddCategory />} /> {/* Updated route */}
                    <Route path="/add-sub-category" element={<SubCategoryForm />} />
                    <Route path="/additional-details" element={<AdditionalDetailsForm />} />
                    <Route path="/add-reference-data" element={<AddReferenceDataForm />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
