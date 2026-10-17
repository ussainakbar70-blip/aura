'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, Plus, FolderKanban, History, Trash2, ExternalLink, 
  RotateCcw, Sparkles, Clock, Check
} from 'lucide-react';
import type { ProjectSummary, VersionSummary } from '@/types';
import { useAuth } from '@/lib/client/auth-context';

interface ProjectsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectId?: string;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onRestoreVersion: (versionNum: number) => void;
  currentVersion: number;
}

export function ProjectsDrawer({
  isOpen,
  onClose,
  currentProjectId,
  onSelectProject,
  onNewProject,
  onRestoreVersion,
  currentVersion,
}: ProjectsDrawerProps) {
  const { user, getToken } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'history'>('projects');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadProjects = async () => {
      setLoading(true);
      try {
        let loadedProjects: ProjectSummary[] = [];

        if (user) {
          const token = await getToken();
          if (token) {
            const res = await fetch('/api/projects', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              loadedProjects = await res.json();
            }

            if (currentProjectId) {
              const vRes = await fetch(`/api/projects/${currentProjectId}/versions`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (vRes.ok) {
                setVersions(await vRes.json());
              }
            }
          }
        }

        // Also merge local storage projects
        try {
          const localRaw = localStorage.getItem('aura_local_projects');
          if (localRaw) {
            const locals = JSON.parse(localRaw);
            if (Array.isArray(locals)) {
              locals.forEach((lp) => {
                if (!loadedProjects.some((p) => p.id === lp.id || p.title === lp.title)) {
                  loadedProjects.push({
                    id: lp.id,
                    title: lp.title,
                    version: lp.version || 1,
                    isPublic: false,
                    updatedAt: lp.updatedAt || Date.now(),
                  });
                }
              });
            }
          }
        } catch {}

        setProjects(loadedProjects);
      } catch (err) {
        console.warn('[aura] Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [isOpen, user, currentProjectId, getToken]);

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const localRaw = localStorage.getItem('aura_local_projects');
      if (localRaw) {
        const locals = JSON.parse(localRaw);
        if (Array.isArray(locals)) {
          const filtered = locals.filter((p: any) => p.id !== id);
          localStorage.setItem('aura_local_projects', JSON.stringify(filtered));
        }
      }
    } catch {}
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-out Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-[#0d0d12] border-r border-zinc-800 h-full flex flex-col z-10 shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Workspace</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: Projects | Version History */}
        <div className="p-2 border-b border-zinc-800 flex gap-1">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'projects'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Version History
          </button>
        </div>

        {/* New Project Button */}
        <div className="p-3 border-b border-zinc-800/60">
          <button
            onClick={() => {
              onNewProject();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-black text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New App</span>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {activeTab === 'projects' ? (
            projects.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No saved projects yet. Build an app to save it here!
              </div>
            ) : (
              projects.map((proj) => {
                const isSelected = proj.id === currentProjectId;
                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj.id);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer group relative ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/30 text-white'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-800/60 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between pr-5">
                      <div className="font-semibold truncate text-zinc-100">{proj.title}</div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                      <span>v{proj.version}.0</span>
                      <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteProject(e, proj.id)}
                      className="absolute right-2 top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer"
                      title="Remove from workspace"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )
          ) : versions.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No previous versions for this project.
            </div>
          ) : (
            versions.map((ver) => {
              const isCurrent = ver.version === currentVersion;
              return (
                <div
                  key={ver.version}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/30 text-white'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-amber-300">v{ver.version}.0</span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(ver.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">&ldquo;{ver.prompt}&rdquo;</p>

                  <div className="pt-1 flex justify-end">
                    {isCurrent ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-3 h-3" />
                        Active Version
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onRestoreVersion(ver.version);
                          onClose();
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Restore v{ver.version}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
