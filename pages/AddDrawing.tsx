import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';

const AddDrawing: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !file) return;
        
        setLoading(true);
        
        const reader = new FileReader();
        reader.onload = (evt) => {
            const fileDataUrl = evt.target?.result as string;
            
            db.drawings.create({
                projectId,
                name,
                fileDataUrl // Store actual data URL
            });
            setLoading(false);
            navigate(`/project/${projectId}`);
        };
        
        reader.readAsDataURL(file);
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Add Drawing</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 shadow-xl rounded-xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Name</label>
                    <input 
                        type="text" 
                        required 
                        className="w-full px-3 py-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary shadow-sm" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="e.g. Floor Plan Level 1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Drawing (Image/PDF)</label>
                    <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        required
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer border border-gray-300 rounded-md" 
                        onChange={handleFileChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">Supports images (PNG, JPG) and PDFs.</p>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium disabled:opacity-50">
                        {loading ? 'Uploading...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddDrawing;