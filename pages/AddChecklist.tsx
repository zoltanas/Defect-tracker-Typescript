import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { ChecklistTemplate } from '../types';

const AddChecklist: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);

    useEffect(() => {
        setTemplates(db.templates.getAll());
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;

        const checklist = db.checklists.create({
            projectId,
            name,
            status: 'Open',
            templateId: templateId || undefined
        });

        if (templateId) {
            const template = templates.find(t => t.id === templateId);
            template?.items.forEach(text => {
                db.checklistItems.create({
                    checklistId: checklist.id,
                    text,
                    isChecked: false
                });
            });
        }

        navigate(`/project/${projectId}`);
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Add Checklist</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 shadow-xl rounded-xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Checklist Name</label>
                    <input type="text" required className="w-full px-3 py-3 border rounded-md" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Daily Safety" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                    <select className="w-full px-3 py-3 border rounded-md bg-white" value={templateId} onChange={e => setTemplateId(e.target.value)}>
                        <option value="">None</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Save</button>
                </div>
            </form>
        </div>
    );
};

export default AddChecklist;