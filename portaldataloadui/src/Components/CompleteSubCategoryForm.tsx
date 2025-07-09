import React, { useState, useEffect } from 'react';
import '../index.css';

interface Category {
  id: number;      // Changed from Id to match the API response
  topicName: string; // Changed from TopicName to match the API response
}

interface SubCategory {
  name: string;
  description: string;
  topicId: number;
}

interface AdditionalDetail {
  name: string;
  adtdetails: string;
}

interface ReferenceData {
  name: string;
  link: string;
}

interface FormData {
  subCategory: SubCategory;
  additionalDetails: AdditionalDetail[];
  referenceData: ReferenceData[];
}

const CompleteSubCategoryForm: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    subCategory: {
      name: '',
      description: '',
      topicId: 0
    },
    additionalDetails: [{ name: '', adtdetails: '' }],
    referenceData: [{ name: '', link: '' }]
  });

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      const workingEndpoint = 'http://localhost:7259/api/GetCategoryList';
           
      try {
        const response = await fetch(workingEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            PageNumber: 1,
            PageSize: 100
          })
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('API Response:', responseData);
        
        // Handle the exact structure we're seeing in the API response
        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          setCategories(responseData.data);
        } else {
          console.error('Unexpected response format:', responseData);
          setMessage('Invalid category data format received.');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setMessage(`Failed to load categories: ${error instanceof Error ? error.message : 'Connection error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.subCategory.name || !formData.subCategory.description || formData.subCategory.topicId <= 0) {
      setMessage('Please fill out all required subcategory fields.');
      setIsSuccess(false);
      return;
    }

    // Filter out empty additional details
    const validAdditionalDetails = formData.additionalDetails.filter(
      detail => detail.name.trim() !== '' && detail.adtdetails.trim() !== ''
    );

    // Filter out empty reference data
    const validReferenceData = formData.referenceData.filter(
      ref => ref.name.trim() !== '' && ref.link.trim() !== ''
    );

    // Prepare data for submission
    const dataToSubmit = {
      subCategory: formData.subCategory,
      additionalDetails: validAdditionalDetails,
      referenceData: validReferenceData
    };

    try {
      const response = await fetch('http://localhost:7259/api/AddCompleteSubCategoryDetails', { // Removed /api prefix
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const responseData = await response.json();
      setMessage(`Subcategory added successfully! ID: ${responseData.subCategoryId}`);
      setIsSuccess(true);
      
      // Reset form
      setFormData({
        subCategory: {
          name: '',
          description: '',
          topicId: 0
        },
        additionalDetails: [{ name: '', adtdetails: '' }],
        referenceData: [{ name: '', link: '' }]
      });
      
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Failed to add subcategory data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSuccess(false);
    }
  };

  // Handle subcategory field changes
  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      subCategory: {
        ...prev.subCategory,
        [name]: name === 'topicId' ? parseInt(value) || 0 : value
      }
    }));
  };

  // Handle additional details field changes
  const handleAdditionalDetailChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newAdditionalDetails = [...formData.additionalDetails];
    newAdditionalDetails[index] = { ...newAdditionalDetails[index], [name]: value };
    
    setFormData(prev => ({
      ...prev,
      additionalDetails: newAdditionalDetails
    }));
  };

  // Handle reference data field changes
  const handleReferenceDataChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newReferenceData = [...formData.referenceData];
    newReferenceData[index] = { ...newReferenceData[index], [name]: value };
    
    setFormData(prev => ({
      ...prev,
      referenceData: newReferenceData
    }));
  };

  // Add new additional detail field
  const addAdditionalDetail = () => {
    setFormData(prev => ({
      ...prev,
      additionalDetails: [...prev.additionalDetails, { name: '', adtdetails: '' }]
    }));
  };

  // Remove additional detail field
  const removeAdditionalDetail = (index: number) => {
    if (formData.additionalDetails.length > 1) {
      const newAdditionalDetails = formData.additionalDetails.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        additionalDetails: newAdditionalDetails
      }));
    }
  };

  // Add new reference data field
  const addReferenceData = () => {
    setFormData(prev => ({
      ...prev,
      referenceData: [...prev.referenceData, { name: '', link: '' }]
    }));
  };

  // Remove reference data field
  const removeReferenceData = (index: number) => {
    if (formData.referenceData.length > 1) {
      const newReferenceData = formData.referenceData.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        referenceData: newReferenceData
      }));
    }
  };

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="complete-form-container">
      <h2>Add Subcategory with Details</h2>
      <form onSubmit={handleSubmit}>
        {/* SubCategory Section */}
        <div className="form-section">
          <h3>Subcategory Information</h3>
          <div className="form-group">
            <label htmlFor="name">Name <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.subCategory.name}
              onChange={handleSubCategoryChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description <span className="required">*</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.subCategory.description}
              onChange={handleSubCategoryChange}
              rows={4}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="topicId">Category <span className="required">*</span></label>
            <select
              id="topicId"
              name="topicId"
              value={formData.subCategory.topicId}
              onChange={handleSubCategoryChange}
              required
            >
              <option value={0}>Select a category</option>
              {categories.length > 0 ? (
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.topicName}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
            {categories.length === 0 && !loading && 
              <div className="form-error">No categories loaded. Please refresh the page.</div>
            }
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="form-section">
          <h3>Additional Details</h3>
          {formData.additionalDetails.map((detail, index) => (
            <div key={`detail-${index}`} className="detail-group">
              <div className="form-group">
                <label htmlFor={`detail-name-${index}`}>Name</label>
                <input
                  type="text"
                  id={`detail-name-${index}`}
                  name="name"
                  value={detail.name}
                  onChange={(e) => handleAdditionalDetailChange(index, e)}
                />
              </div>
              <div className="form-group">
                <label htmlFor={`detail-adtdetails-${index}`}>Details</label>
                <textarea
                  id={`detail-adtdetails-${index}`}
                  name="adtdetails"
                  value={detail.adtdetails}
                  onChange={(e) => handleAdditionalDetailChange(index, e)}
                  rows={3}
                />
              </div>
              <div className="button-group">
                <button 
                  type="button" 
                  className="remove-button"
                  onClick={() => removeAdditionalDetail(index)}
                  disabled={formData.additionalDetails.length <= 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
         
        </div>

        {/* Reference Data Section */}
        <div className="form-section">
          <h3>Reference Data</h3>
          {formData.referenceData.map((reference, index) => (
            <div key={`reference-${index}`} className="reference-group">
              <div className="form-group">
                <label htmlFor={`reference-name-${index}`}>Name</label>
                <input
                  type="text"
                  id={`reference-name-${index}`}
                  name="name"
                  value={reference.name}
                  onChange={(e) => handleReferenceDataChange(index, e)}
                />
              </div>
              <div className="form-group">
                <label htmlFor={`reference-link-${index}`}>Link</label>
                <input
                  type="text"
                  id={`reference-link-${index}`}
                  name="link"
                  value={reference.link}
                  onChange={(e) => handleReferenceDataChange(index, e)}
                />
              </div>
              <div className="button-group">
                <button 
                  type="button" 
                  className="remove-button"
                  onClick={() => removeReferenceData(index)}
                  disabled={formData.referenceData.length <= 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="add-button" onClick={addReferenceData}>
            + Add More References
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">Submit</button>
        </div>

        {message && (
          <div className={`message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CompleteSubCategoryForm;