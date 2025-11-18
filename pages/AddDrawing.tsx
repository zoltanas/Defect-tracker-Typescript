import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';

const AddDrawing: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    // For simulation, we don't actually process PDF bytes in browser localstorage due to size
    // We'll store a dummy value or a very small placeholder
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;
        
        // In a real app, upload file. Here, create a record.
        db.drawings.create({
            projectId,
            name,
            fileDataUrl: 'placeholder_pdf_data' 
        });
        navigate(`/project/${projectId}`);
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Add Drawing</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 shadow-xl rounded-xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Name</label>
                    <input type="text" required className="w-full px-3 py-3 border rounded-md" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF</label>
                    <input type="file" accept="application/pdf" className="w-full text-sm text-gray-500" />
                    <p className="text-xs text-gray-500 mt-1">Simulation: File upload not persisted in demo.</p>
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Save</button>
                </div>
            </form>
        </div>
    );
};

export default AddDrawing;