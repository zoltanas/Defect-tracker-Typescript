import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';

const AddProject: React.FC = () => {
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        db.projects.create({ name, creatorId: user.id });
        navigate('/dashboard');
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Create a New Project</h1>
                <p className="text-sm text-gray-600">Fill in the details below to start a new project.</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 shadow-xl rounded-xl space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <input
                        type="text"
                        id="name"
                        required
                        className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-gray-900 placeholder-gray-500"
                        placeholder="E.g., Skyscraper Construction Phase 1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-8">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm"
                    >
                        Save Project
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProject;