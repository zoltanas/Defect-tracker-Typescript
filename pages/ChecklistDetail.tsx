import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Checklist, ChecklistItem } from '../types';

const ChecklistDetail: React.FC = () => {
    const { checklistId } = useParams<{ checklistId: string }>();
    const navigate = useNavigate();
    const [checklist, setChecklist] = useState<Checklist | null>(null);
    const [items, setItems] = useState<ChecklistItem[]>([]);

    useEffect(() => {
        if (checklistId) {
            setChecklist(db.checklists.getById(checklistId) || null);
            setItems(db.checklistItems.getByChecklist(checklistId));
        }
    }, [checklistId]);

    const toggleItem = (item: ChecklistItem) => {
        const updated = { ...item, isChecked: !item.isChecked };
        db.checklistItems.update(updated);
        setItems(items.map(i => i.id === item.id ? updated : i));
    };

    if (!checklist) return <div>Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{checklist.name}</h1>
                <button onClick={() => navigate(`/project/${checklist.projectId}`)} className="bg-gray-600 text-white px-4 py-2 rounded text-sm">Back</button>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                {items.length === 0 ? <p className="text-gray-500">No items.</p> : (
                    <ul className="space-y-4">
                        {items.map(item => (
                            <li key={item.id} className="flex items-center border p-3 rounded hover:bg-gray-50">
                                <input 
                                    type="checkbox" 
                                    checked={item.isChecked} 
                                    onChange={() => toggleItem(item)}
                                    className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <span className={`ml-3 ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.text}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ChecklistDetail;