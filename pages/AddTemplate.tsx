import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';

const AddTemplate: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [itemsText, setItemsText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const items = itemsText.split('\n').map(i => i.trim()).filter(i => i.length > 0);
        db.templates.create({ name, items });
        navigate(`/project/${projectId}`); // Simply return to project
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">New Template</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 shadow-xl rounded-xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                    <input type="text" required className="w-full px-3 py-3 border rounded-md" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Items (one per line)</label>
                    <textarea required rows={6} className="w-full px-3 py-3 border rounded-md" value={itemsText} onChange={e => setItemsText(e.target.value)} placeholder="Item 1&#10;Item 2"></textarea>
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Save Template</button>
                </div>
            </form>
        </div>
    );
};

export default AddTemplate;