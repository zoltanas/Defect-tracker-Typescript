export enum Role {
    ADMIN = 'admin',
    EXPERT = 'expert',
    CONTRACTOR = 'contractor',
    SUPERVISOR = 'Technical supervisor'
}

export interface User {
    id: string;
    email: string;
    password?: string; // In real app hashed, here plain for mock
    name: string;
    company: string;
    role: Role; // Global role or default role
}

export interface Project {
    id: string;
    name: string;
    creatorId: string;
}

export interface ProjectAccess {
    id: string;
    userId: string;
    projectId: string;
    role: Role;
}

export interface Attachment {
    id: string;
    fileDataUrl: string; // Base64
    fileName: string;
    thumbnailUrl?: string;
    parentId: string; // Defect ID or ChecklistItem ID
    parentType: 'defect' | 'checklist_item' | 'comment';
}

export interface Defect {
    id: string;
    projectId: string;
    description: string;
    status: 'Open' | 'Closed' | 'OpenWithReply';
    creatorId: string;
    creationDate: string; // ISO string
    closeDate?: string;
    drawingId?: string;
    markerX?: number;
    markerY?: number;
    pageNum?: number;
}

export interface Comment {
    id: string;
    defectId: string;
    userId: string;
    content: string;
    createdAt: string;
}

export interface ChecklistTemplate {
    id: string;
    name: string;
    items: string[]; // Array of item texts
}

export interface Checklist {
    id: string;
    projectId: string;
    name: string;
    status: 'Open' | 'Closed';
    templateId?: string;
}

export interface ChecklistItem {
    id: string;
    checklistId: string;
    text: string;
    isChecked: boolean;
    comments?: string;
}

export interface Drawing {
    id: string;
    projectId: string;
    name: string;
    fileDataUrl: string; // Base64 PDF data
}

// Helper type for Dashboard
export interface ProjectStats {
    project: Project;
    openDefects: number;
    openDefectsWithReply: number;
    openChecklists: number;
    hasDrawings: boolean;
}