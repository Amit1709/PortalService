// AddReferenceData.tsx
import React, { useState } from 'react';
import '../index.css';

interface ReferenceData {
    name: string;
    link: string;
    subcatid: number;
}

const AddReferenceDataForm: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [link, setLink] = useState<string>('');
    const [subcatid, setSubCatId] = useState<number | undefined>();
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !link || subcatid === undefined) {
            setMessage('Please fill out all fields.');
            return;
        }

        const data: ReferenceData = { name, link, subcatid };

        try {
            const response = await fetch('http://localhost:7259/api/AddReferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                setMessage('Network response was not ok');
            }

            //await response.json();
            setMessage('Reference data added successfully!');
        } catch (error) {
            console.error('Error:', error);
            setMessage('Failed to add reference data. Please try again.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="reference-data-form">
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Link</label>
                    <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Sub Category ID</label>
                    <input
                        type="number"
                        value={subcatid}
                        onChange={(e) => setSubCatId(Number(e.target.value))}
                    />
                </div>
                <button type="submit">Submit</button>
                {message && <p className="message">{message}</p>}
            </form>
        </div>
    );
};

export default AddReferenceDataForm;
