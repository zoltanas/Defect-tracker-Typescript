
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { ChecklistTemplate } from '../types';

const AddTemplate: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [itemsText, setItemsText] = useState('');
    const [existingTemplates, setExistingTemplates] = useState<ChecklistTemplate[]>([]);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        setExistingTemplates(db.templates.getAll());
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const items = itemsText.split('\n').map(i => i.trim()).filter(i => i.length > 0);
        db.templates.create({ name, items });
        // After create, refresh list
        setExistingTemplates(db.templates.getAll());
        setName('');
        setItemsText('');
        setSuccessMsg('Template created successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Manage Checklists Templates</h1>
                <button onClick={() => navigate(`/project/${projectId}`)} className="text-primary hover:underline font-medium">Back to Project</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="bg-white p-6 shadow-xl rounded-xl">
                        <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">Create New Template</h2>
                        {successMsg && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
                                {successMsg}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    placeholder="e.g. Site Safety Inspection"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Checklist Items (one per line)</label>
                                <textarea 
                                    required 
                                    rows={8} 
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm" 
                                    value={itemsText} 
                                    onChange={e => setItemsText(e.target.value)} 
                                    placeholder="Check hard hats&#10;Verify harness safety&#10;Inspect scaffolding"
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-primary text-white px-4 py-3 rounded-md shadow-sm hover:bg-primary-hover font-medium transition-colors">
                                Create Template
                            </button>
                        </form>
                    </div>
                </div>

                <div>
                    <div className="bg-white p-6 shadow-lg rounded-xl h-full">
                        <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">Existing Templates</h2>
                        <div className="max-h-[600px] overflow-y-auto pr-2">
                            {existingTemplates.length === 0 ? (
                                <p className="text-gray-500 italic text-center py-8">No templates created yet.</p>
                            ) : (
                                <ul className="space-y-6">
                                    {existingTemplates.map(t => (
                                        <li key={t.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h3 className="font-bold text-gray-900 text-lg mb-2">{t.name}</h3>
                                            <div className="bg-white p-3 rounded border border-gray-200">
                                                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                                    {t.items.slice(0, 4).map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                    {t.items.length > 4 && <li className="list-none text-xs text-gray-400 pt-1 font-medium">...and {t.items.length - 4} more</li>}
                                                </ul>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTemplate;
