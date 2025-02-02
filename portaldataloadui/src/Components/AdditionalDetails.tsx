import React, { useState } from 'react';
import '../index.css'; // Correct import path

interface AdditionalDetails {
    name: string;
    adtdetails: string;
    subcatid: number;
}

const AdditionalDetailsForm: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [adtdetails, setAdtDetails] = useState<string>('');
    const [subcatid, setSubCatId] = useState<number | undefined>();
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !adtdetails || subcatid === undefined) {
            setMessage('Please fill out all fields.');
            return;
        }

        const data: AdditionalDetails = { name, adtdetails, subcatid };

        try {
            const response = await fetch('http://localhost:7259/api/AddAdditionalDetails', {
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
                setMessage('Details added successfully!');
            } else {
                setMessage('Api Response :' + responseData);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Failed to add details. Please try again.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="details-form">
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Additional Details</label>
                    <textarea
                        value={adtdetails}
                        onChange={(e) => setAdtDetails(e.target.value)}
                        rows={4}
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

export default AdditionalDetailsForm;
