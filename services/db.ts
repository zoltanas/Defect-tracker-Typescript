import { User, Project, ProjectAccess, Defect, Comment, Checklist, ChecklistItem, ChecklistTemplate, Drawing, Attachment, Role } from '../types';

const STORAGE_KEYS = {
    USERS: 'dt_users',
    PROJECTS: 'dt_projects',
    ACCESS: 'dt_access',
    DEFECTS: 'dt_defects',
    COMMENTS: 'dt_comments',
    CHECKLISTS: 'dt_checklists',
    CHECKLIST_ITEMS: 'dt_checklist_items',
    TEMPLATES: 'dt_templates',
    DRAWINGS: 'dt_drawings',
    ATTACHMENTS: 'dt_attachments',
    CURRENT_USER: 'dt_current_user'
};

// Helper to generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Seed Data
const seedData = () => {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const adminUser: User = {
            id: 'user_admin',
            email: 'admin@example.com',
            password: 'password',
            name: 'Admin User',
            company: 'Defect Tracker Inc.',
            role: Role.ADMIN
        };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) localStorage.setItem(STORAGE_KEYS.PROJECTS, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.ACCESS)) localStorage.setItem(STORAGE_KEYS.ACCESS, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.DEFECTS)) localStorage.setItem(STORAGE_KEYS.DEFECTS, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) localStorage.setItem(STORAGE_KEYS.COMMENTS, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.CHECKLISTS)) localStorage.setItem(STORAGE_KEYS.CHECKLISTS, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.CHECKLIST_ITEMS)) localStorage.setItem(STORAGE_KEYS.CHECKLIST_ITEMS, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) localStorage.setItem(STORAGE_KEYS.TEMPLATES, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.DRAWINGS)) localStorage.setItem(STORAGE_KEYS.DRAWINGS, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.ATTACHMENTS)) localStorage.setItem(STORAGE_KEYS.ATTACHMENTS, '[]');
};

seedData();

// Generic Getters/Setters
const getCollection = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const setCollection = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

export const db = {
    users: {
        getAll: () => getCollection<User>(STORAGE_KEYS.USERS),
        getById: (id: string) => getCollection<User>(STORAGE_KEYS.USERS).find(u => u.id === id),
        getByEmail: (email: string) => getCollection<User>(STORAGE_KEYS.USERS).find(u => u.email === email),
        create: (user: Omit<User, 'id'>) => {
            const users = getCollection<User>(STORAGE_KEYS.USERS);
            const newUser = { ...user, id: generateId() };
            users.push(newUser);
            setCollection(STORAGE_KEYS.USERS, users);
            return newUser;
        },
        update: (user: User) => {
            const users = getCollection<User>(STORAGE_KEYS.USERS);
            const index = users.findIndex(u => u.id === user.id);
            if (index !== -1) {
                users[index] = user;
                setCollection(STORAGE_KEYS.USERS, users);
            }
        }
    },
    projects: {
        getAll: () => getCollection<Project>(STORAGE_KEYS.PROJECTS),
        getById: (id: string) => getCollection<Project>(STORAGE_KEYS.PROJECTS).find(p => p.id === id),
        create: (project: Omit<Project, 'id'>) => {
            const projects = getCollection<Project>(STORAGE_KEYS.PROJECTS);
            const newProject = { ...project, id: generateId() };
            projects.push(newProject);
            setCollection(STORAGE_KEYS.PROJECTS, projects);
            return newProject;
        },
        delete: (id: string) => {
            let projects = getCollection<Project>(STORAGE_KEYS.PROJECTS);
            projects = projects.filter(p => p.id !== id);
            setCollection(STORAGE_KEYS.PROJECTS, projects);
            // Cascade delete related items skipped for brevity in this simplified mock
        }
    },
    access: {
        getAll: () => getCollection<ProjectAccess>(STORAGE_KEYS.ACCESS),
        getByUserId: (userId: string) => getCollection<ProjectAccess>(STORAGE_KEYS.ACCESS).filter(a => a.userId === userId),
        create: (access: Omit<ProjectAccess, 'id'>) => {
            const accesses = getCollection<ProjectAccess>(STORAGE_KEYS.ACCESS);
            const newAccess = { ...access, id: generateId() };
            accesses.push(newAccess);
            setCollection(STORAGE_KEYS.ACCESS, accesses);
            return newAccess;
        }
    },
    defects: {
        getAll: () => getCollection<Defect>(STORAGE_KEYS.DEFECTS),
        getByProject: (projectId: string) => getCollection<Defect>(STORAGE_KEYS.DEFECTS).filter(d => d.projectId === projectId),
        getById: (id: string) => getCollection<Defect>(STORAGE_KEYS.DEFECTS).find(d => d.id === id),
        create: (defect: Omit<Defect, 'id' | 'creationDate'>) => {
            const defects = getCollection<Defect>(STORAGE_KEYS.DEFECTS);
            const newDefect = { ...defect, id: generateId(), creationDate: new Date().toISOString() };
            defects.push(newDefect);
            setCollection(STORAGE_KEYS.DEFECTS, defects);
            return newDefect;
        },
        update: (defect: Defect) => {
            const defects = getCollection<Defect>(STORAGE_KEYS.DEFECTS);
            const index = defects.findIndex(d => d.id === defect.id);
            if (index !== -1) {
                defects[index] = defect;
                setCollection(STORAGE_KEYS.DEFECTS, defects);
            }
        }
    },
    checklists: {
        getByProject: (projectId: string) => getCollection<Checklist>(STORAGE_KEYS.CHECKLISTS).filter(c => c.projectId === projectId),
        getById: (id: string) => getCollection<Checklist>(STORAGE_KEYS.CHECKLISTS).find(c => c.id === id),
        create: (checklist: Omit<Checklist, 'id'>) => {
            const list = getCollection<Checklist>(STORAGE_KEYS.CHECKLISTS);
            const newItem = { ...checklist, id: generateId() };
            list.push(newItem);
            setCollection(STORAGE_KEYS.CHECKLISTS, list);
            return newItem;
        }
    },
    checklistItems: {
        getByChecklist: (checklistId: string) => getCollection<ChecklistItem>(STORAGE_KEYS.CHECKLIST_ITEMS).filter(i => i.checklistId === checklistId),
        create: (item: Omit<ChecklistItem, 'id'>) => {
            const list = getCollection<ChecklistItem>(STORAGE_KEYS.CHECKLIST_ITEMS);
            const newItem = { ...item, id: generateId() };
            list.push(newItem);
            setCollection(STORAGE_KEYS.CHECKLIST_ITEMS, list);
            return newItem;
        },
        update: (item: ChecklistItem) => {
             const list = getCollection<ChecklistItem>(STORAGE_KEYS.CHECKLIST_ITEMS);
             const idx = list.findIndex(i => i.id === item.id);
             if (idx !== -1) {
                 list[idx] = item;
                 setCollection(STORAGE_KEYS.CHECKLIST_ITEMS, list);
             }
        }
    },
    templates: {
        getAll: () => getCollection<ChecklistTemplate>(STORAGE_KEYS.TEMPLATES),
        create: (template: Omit<ChecklistTemplate, 'id'>) => {
            const list = getCollection<ChecklistTemplate>(STORAGE_KEYS.TEMPLATES);
            const newItem = { ...template, id: generateId() };
            list.push(newItem);
            setCollection(STORAGE_KEYS.TEMPLATES, list);
            return newItem;
        }
    },
    drawings: {
        getByProject: (projectId: string) => getCollection<Drawing>(STORAGE_KEYS.DRAWINGS).filter(d => d.projectId === projectId),
        getById: (id: string) => getCollection<Drawing>(STORAGE_KEYS.DRAWINGS).find(d => d.id === id),
        create: (drawing: Omit<Drawing, 'id'>) => {
             const list = getCollection<Drawing>(STORAGE_KEYS.DRAWINGS);
             const newItem = { ...drawing, id: generateId() };
             list.push(newItem);
             setCollection(STORAGE_KEYS.DRAWINGS, list);
             return newItem;
        },
        delete: (id: string) => {
            let list = getCollection<Drawing>(STORAGE_KEYS.DRAWINGS);
            list = list.filter(d => d.id !== id);
            setCollection(STORAGE_KEYS.DRAWINGS, list);
        }
    },
    attachments: {
        getByParent: (parentId: string) => getCollection<Attachment>(STORAGE_KEYS.ATTACHMENTS).filter(a => a.parentId === parentId),
        getById: (id: string) => getCollection<Attachment>(STORAGE_KEYS.ATTACHMENTS).find(a => a.id === id),
        create: (attachment: Omit<Attachment, 'id'>) => {
             const list = getCollection<Attachment>(STORAGE_KEYS.ATTACHMENTS);
             const newItem = { ...attachment, id: generateId() };
             list.push(newItem);
             setCollection(STORAGE_KEYS.ATTACHMENTS, list);
             return newItem;
        },
        update: (attachment: Attachment) => {
            const list = getCollection<Attachment>(STORAGE_KEYS.ATTACHMENTS);
            const idx = list.findIndex(a => a.id === attachment.id);
            if (idx !== -1) {
                list[idx] = attachment;
                setCollection(STORAGE_KEYS.ATTACHMENTS, list);
            }
        },
        delete: (id: string) => {
            let list = getCollection<Attachment>(STORAGE_KEYS.ATTACHMENTS);
            list = list.filter(a => a.id !== id);
            setCollection(STORAGE_KEYS.ATTACHMENTS, list);
        }
    }
};
