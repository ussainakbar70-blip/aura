import { adminDb, isAdminConfigured } from './firebase-admin';
import { ApiError } from './errors';
import type { ChatMessage, ProjectDetail, ProjectSummary, VersionSummary } from '@/types';

const inMemoryProjects = new Map<string, ProjectDetail>();
const inMemoryVersions = new Map<string, VersionSummary[]>();
const inMemoryVersionHtml = new Map<string, string>();

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

const isLocalUid = (uid: string) => !isAdminConfigured() || uid.startsWith('guest') || uid.startsWith('demo_');

export async function listProjects(uid: string): Promise<ProjectSummary[]> {
  if (!isLocalUid(uid)) {
    try {
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
    } catch (err) {
      console.warn('[aura-projects] Firestore listProjects fallback to in-memory:', err);
    }
  }
  return Array.from(inMemoryProjects.values()).map((p) => ({
    id: p.id,
    title: p.title,
    version: p.version,
    isPublic: p.isPublic,
    updatedAt: p.updatedAt,
  }));
}

export async function getProject(uid: string, projectId: string): Promise<ProjectDetail> {
  if (!isLocalUid(uid)) {
    try {
      const snap = await projectsCol(uid).doc(projectId).get();
      if (snap.exists) {
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
    } catch (err) {
      console.warn('[aura-projects] Firestore getProject fallback to in-memory:', err);
    }
  }
  const existing = inMemoryProjects.get(projectId);
  if (!existing) {
    throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project does not exist or was deleted.');
  }
  return existing;
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
  let id = `proj_${now}_${Math.random().toString(36).substring(2, 7)}`;

  if (!isLocalUid(uid)) {
    try {
      const ref = projectsCol(uid).doc();
      id = ref.id;
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
    } catch (err) {
      console.warn('[aura-projects] Firestore createProject fallback to in-memory:', err);
    }
  }

  const detail: ProjectDetail = {
    id,
    title: initial.title,
    version: 1,
    isPublic: false,
    updatedAt: now,
    html: initial.html,
    model: initial.model,
    messages: [initial.userMessage, initial.assistantMessage],
  };
  inMemoryProjects.set(id, detail);
  inMemoryVersions.set(id, [{
    version: 1,
    prompt: initial.prompt,
    model: initial.model,
    createdAt: now,
  }]);
  inMemoryVersionHtml.set(`${id}_1`, initial.html);
  return detail;
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
  const now = Date.now();

  if (!isLocalUid(uid)) {
    try {
      const ref = projectsCol(uid).doc(projectId);
      const snap = await ref.get();
      if (snap.exists) {
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
          messages: updatedMessages.slice(-60),
          updatedAt: now,
        });
        batch.set(versionsCol(uid, projectId).doc(`v${newVersion}`), versionDoc);
        await batch.commit();

        return { version: newVersion, title };
      }
    } catch (err) {
      console.warn('[aura-projects] Firestore recordIteration fallback to in-memory:', err);
    }
  }

  const current = inMemoryProjects.get(projectId);
  const newVersion = (current?.version ?? 1) + 1;
  const title = iteration.newTitle || current?.title || 'Untitled App';
  const updatedMessages = [...(current?.messages ?? []), iteration.userMessage, iteration.assistantMessage];
  const updatedDetail: ProjectDetail = {
    id: projectId,
    title,
    version: newVersion,
    isPublic: current?.isPublic ?? false,
    updatedAt: now,
    html: iteration.html,
    model: iteration.model,
    messages: updatedMessages.slice(-60),
  };
  inMemoryProjects.set(projectId, updatedDetail);
  const vers = inMemoryVersions.get(projectId) || [];
  vers.unshift({
    version: newVersion,
    prompt: iteration.prompt,
    model: iteration.model,
    createdAt: now,
  });
  inMemoryVersions.set(projectId, vers);
  inMemoryVersionHtml.set(`${projectId}_${newVersion}`, iteration.html);
  return { version: newVersion, title };
}

export async function listVersions(uid: string, projectId: string): Promise<VersionSummary[]> {
  if (!isLocalUid(uid)) {
    try {
      const snap = await versionsCol(uid, projectId).orderBy('version', 'desc').limit(30).get();
      if (!snap.empty) {
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
    } catch (err) {
      console.warn('[aura-projects] Firestore listVersions fallback to in-memory:', err);
    }
  }
  return inMemoryVersions.get(projectId) || [];
}

export async function getVersionHtml(uid: string, projectId: string, versionNumber: number): Promise<string> {
  if (!isLocalUid(uid)) {
    try {
      const snap = await versionsCol(uid, projectId).doc(`v${versionNumber}`).get();
      if (snap.exists) {
        return (snap.data() as VersionDoc).html;
      }
    } catch (err) {
      console.warn('[aura-projects] Firestore getVersionHtml fallback to in-memory:', err);
    }
  }
  const html = inMemoryVersionHtml.get(`${projectId}_${versionNumber}`);
  if (!html) {
    throw new ApiError(404, 'VERSION_NOT_FOUND', `Version v${versionNumber} was not found.`);
  }
  return html;
}

export async function updateProject(
  uid: string,
  projectId: string,
  patch: { title?: string; isPublic?: boolean }
): Promise<void> {
  const existing = inMemoryProjects.get(projectId);
  if (existing) {
    if (patch.title) existing.title = patch.title;
    if (patch.isPublic !== undefined) existing.isPublic = patch.isPublic;
    existing.updatedAt = Date.now();
    inMemoryProjects.set(projectId, existing);
  }
  if (!isLocalUid(uid)) {
    try {
      const ref = projectsCol(uid).doc(projectId);
      await ref.update({
        ...patch,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.warn('[aura-projects] Firestore updateProject warning:', err);
    }
  }
}

export async function deleteProject(uid: string, projectId: string): Promise<void> {
  inMemoryProjects.delete(projectId);
  inMemoryVersions.delete(projectId);
  if (!isLocalUid(uid)) {
    try {
      await projectsCol(uid).doc(projectId).delete();
    } catch (err) {
      console.warn('[aura-projects] Firestore deleteProject warning:', err);
    }
  }
}

/** Public preview resolution for shared projects. */
export async function getPublicProject(
  uid: string,
  projectId: string
): Promise<{ title: string; html: string; version: number } | null> {
  if (!isLocalUid(uid)) {
    try {
      const snap = await projectsCol(uid).doc(projectId).get();
      if (snap.exists) {
        const data = snap.data() as ProjectDoc;
        if (!data.isPublic) return null;
        return {
          title: data.title ?? 'Aura App',
          html: data.html ?? '',
          version: data.version ?? 1,
        };
      }
    } catch (err) {
      console.warn('[aura-projects] Firestore getPublicProject fallback to in-memory:', err);
    }
  }
  const existing = inMemoryProjects.get(projectId);
  if (!existing || !existing.isPublic) return null;
  return {
    title: existing.title,
    html: existing.html,
    version: existing.version,
  };
}
