import React, { useState } from 'react';
import '../index.css'; // Correct import path

interface SubCategory {
    name: string;
    description: string;
    topicid: number;
}

const SubCategoryForm: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [topicid, setTopicId] = useState<number | undefined>();
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !description || topicid === undefined) {
            setMessage('Please fill out all fields.');
            return;
        }

        const data: SubCategory = { name, description, topicid };

        try {
            const response = await fetch('http://localhost:7259/api/AddSubCategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                setMessage('Network response was not ok');
            }

            const responseData = response.status;

            if (responseData==201) {
                setMessage('Sub-category added successfully!');
            } else {
                setMessage('Response status : ' + responseData);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Failed to add sub-category. Please try again.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="sub-category-form">
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={8}
                    />
                </div>
                <div className="form-group">
                    <label>Topic ID</label>
                    <input
                        type="number"
                        value={topicid}
                        onChange={(e) => setTopicId(Number(e.target.value))}
                    />
                </div>
                <button type="submit">Submit</button>
                {message && <p className="message">{message}</p>}
            </form>
        </div>
    );
};

export default SubCategoryForm;
