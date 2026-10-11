import { adminDb } from './firebase-admin';
import { ApiError } from './errors';
import type { ChatMessage, ProjectDetail, ProjectSummary, VersionSummary } from '@/types';

const usersCol = () => adminDb().collection('users');
const projectsCol = (uid: string) => usersCol().doc(uid).collection('projects');
const versionsCol = (uid: string, projectId: string) =>
  projectsCol(uid).doc(projectId).collection('versions');

export interface ProjectDoc {
  title: string;
  version: number;
  isPublic: boolean;
  model: string | null;
  html: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface VersionDoc {
  version: number;
  prompt: string;
  model: string | null;
  html: string;
  createdAt: number;
}

export async function listProjects(uid: string): Promise<ProjectSummary[]> {
  const snap = await projectsCol(uid).orderBy('updatedAt', 'desc').limit(50).get();
  return snap.docs.map((doc) => {
    const data = doc.data() as ProjectDoc;
    return {
      id: doc.id,
      title: data.title ?? 'Untitled App',
      version: data.version ?? 1,
      isPublic: Boolean(data.isPublic),
      updatedAt: data.updatedAt ?? Date.now(),
    };
  });
}

export async function getProject(uid: string, projectId: string): Promise<ProjectDetail> {
  const snap = await projectsCol(uid).doc(projectId).get();
  if (!snap.exists) {
    throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project does not exist or was deleted.');
  }
  const data = snap.data() as ProjectDoc;
  return {
    id: snap.id,
    title: data.title ?? 'Untitled App',
    version: data.version ?? 1,
    isPublic: Boolean(data.isPublic),
    updatedAt: data.updatedAt ?? Date.now(),
    html: data.html ?? '',
    model: data.model ?? null,
    messages: Array.isArray(data.messages) ? data.messages : [],
  };
}

export async function createProject(
  uid: string,
  initial: {
    title: string;
    html: string;
    model: string;
    prompt: string;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
  }
): Promise<ProjectDetail> {
  const now = Date.now();
  const ref = projectsCol(uid).doc();
  const projectDoc: ProjectDoc = {
    title: initial.title,
    version: 1,
    isPublic: false,
    model: initial.model,
    html: initial.html,
    messages: [initial.userMessage, initial.assistantMessage],
    createdAt: now,
    updatedAt: now,
  };

  const versionDoc: VersionDoc = {
    version: 1,
    prompt: initial.prompt,
    model: initial.model,
    html: initial.html,
    createdAt: now,
  };

  const batch = adminDb().batch();
  batch.set(ref, projectDoc);
  batch.set(versionsCol(uid, ref.id).doc('v1'), versionDoc);
  await batch.commit();

  return {
    id: ref.id,
    title: projectDoc.title,
    version: 1,
    isPublic: false,
    updatedAt: now,
    html: projectDoc.html,
    model: projectDoc.model,
    messages: projectDoc.messages,
  };
}

export async function recordIteration(
  uid: string,
  projectId: string,
  iteration: {
    html: string;
    model: string;
    prompt: string;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    newTitle?: string;
  }
): Promise<{ version: number; title: string }> {
  const ref = projectsCol(uid).doc(projectId);
  const now = Date.now();

  const snap = await ref.get();
  if (!snap.exists) {
    throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project does not exist.');
  }

  const current = snap.data() as ProjectDoc;
  const newVersion = (current.version ?? 1) + 1;
  const title = iteration.newTitle || current.title;

  const versionDoc: VersionDoc = {
    version: newVersion,
    prompt: iteration.prompt,
    model: iteration.model,
    html: iteration.html,
    createdAt: now,
  };

  const updatedMessages = [...(current.messages ?? []), iteration.userMessage, iteration.assistantMessage];

  const batch = adminDb().batch();
  batch.update(ref, {
    title,
    version: newVersion,
    html: iteration.html,
    model: iteration.model,
    messages: updatedMessages.slice(-60), // Keep last 60 turns in active doc
    updatedAt: now,
  });
  batch.set(versionsCol(uid, projectId).doc(`v${newVersion}`), versionDoc);
  await batch.commit();

  return { version: newVersion, title };
}

export async function listVersions(uid: string, projectId: string): Promise<VersionSummary[]> {
  const snap = await versionsCol(uid, projectId).orderBy('version', 'desc').limit(30).get();
  return snap.docs.map((doc) => {
    const data = doc.data() as VersionDoc;
    return {
      version: data.version,
      prompt: data.prompt,
      model: data.model,
      createdAt: data.createdAt,
    };
  });
}

export async function getVersionHtml(uid: string, projectId: string, versionNumber: number): Promise<string> {
  const snap = await versionsCol(uid, projectId).doc(`v${versionNumber}`).get();
  if (!snap.exists) {
    throw new ApiError(404, 'VERSION_NOT_FOUND', `Version v${versionNumber} was not found.`);
  }
  return (snap.data() as VersionDoc).html;
}

export async function updateProject(
  uid: string,
  projectId: string,
  patch: { title?: string; isPublic?: boolean }
): Promise<void> {
  const ref = projectsCol(uid).doc(projectId);
  await ref.update({
    ...patch,
    updatedAt: Date.now(),
  });
}

export async function deleteProject(uid: string, projectId: string): Promise<void> {
  await projectsCol(uid).doc(projectId).delete();
}

/** Public preview resolution for shared projects. */
export async function getPublicProject(
  uid: string,
  projectId: string
): Promise<{ title: string; html: string; version: number } | null> {
  const snap = await projectsCol(uid).doc(projectId).get();
  if (!snap.exists) return null;
  const data = snap.data() as ProjectDoc;
  if (!data.isPublic) return null;
  return {
    title: data.title ?? 'Aura App',
    html: data.html ?? '',
    version: data.version ?? 1,
  };
}
