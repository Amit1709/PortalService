import React, { useState } from 'react';
import '../index.css'; // Correct import path

interface Category {
    name: string;
    description: string;
}

const AddCategory: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !description) {
            setMessage('Please fill out all fields.');
            return;
        }

        const data: Category = { name, description };

        try {
            const response = await fetch('http://localhost:7259/api/AddCategory', {
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
                setMessage('Category added successfully!');
            } else {
                setMessage('Api Response :' + responseData);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Failed to add category. Please try again.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="category-form">
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
                <button type="submit">Submit</button>
                {message && <p className="message">{message}</p>}
            </form>
        </div>
    );
};

export default AddCategory;
