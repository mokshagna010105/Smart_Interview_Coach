import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient.js';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  Star,
  RefreshCw,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Code,
  Calendar
} from 'lucide-react';

export const ResumePage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 1. Fetch user resumes
  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ['userResumes'],
    queryFn: async () => {
      const res = await apiClient.get('/resumes');
      return res.data || [];
    }
  });

  // 2. Fetch specific selected resume details
  const activeResumeId = selectedResumeId || (resumes.length > 0 ? (resumes.find(r => r.isDefault)?._id || resumes[0]._id) : null);

  const { data: activeResume, isLoading: isResumeLoading } = useQuery({
    queryKey: ['resumeDetail', activeResumeId],
    queryFn: async () => {
      if (!activeResumeId) return null;
      const res = await apiClient.get(`/resumes/${activeResumeId}`);
      return res.data;
    },
    enabled: !!activeResumeId
  });

  // 3. Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await apiClient.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (newResume) => {
      setUploadError('');
      queryClient.invalidateQueries({ queryKey: ['userResumes'] });
      setSelectedResumeId(newResume._id);
    },
    onError: (err) => {
      setUploadError(err.message || 'Failed to upload and parse resume');
    }
  });

  // 4. Set Default Mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id) => {
      await apiClient.patch(`/resumes/${id}/default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userResumes'] });
    }
  });

  // 5. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await apiClient.delete(`/resumes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userResumes'] });
      setSelectedResumeId(null);
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Resume Management & Parser
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Upload your resume (PDF or DOCX). Our parser automatically extracts skills, projects, and work history to tailor interview questions.
        </p>
      </div>

      {uploadError && (
        <div className="flex items-start space-x-3 rounded-2xl bg-red-50 p-4 border border-red-200 dark:bg-red-950/40 dark:border-red-900 text-red-800 dark:text-red-300">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-semibold">{uploadError}</p>
        </div>
      )}

      {/* Upload Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
          isDragging
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
            : 'border-slate-200 bg-white hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 mb-4 shadow-sm">
          {uploadMutation.isPending ? (
            <RefreshCw className="h-7 w-7 animate-spin" />
          ) : (
            <UploadCloud className="h-7 w-7" />
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {uploadMutation.isPending ? 'Uploading & Parsing Resume...' : 'Upload your resume'}
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Drag & drop your file here, or browse from device (PDF, DOCX up to 5MB)
        </p>
      </div>

      {/* Main Resumes & Parsing Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Uploaded Resumes List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Uploaded Resumes ({resumes.length})
          </h2>

          {isLoading ? (
            <div className="flex items-center space-x-2 text-slate-400 text-xs py-4">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading resumes...</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <FileText className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">No resumes uploaded yet. Upload your first resume above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  onClick={() => setSelectedResumeId(resume._id)}
                  className={`rounded-2xl border p-4 cursor-pointer transition ${
                    activeResumeId === resume._id
                      ? 'border-brand-500 bg-brand-50/40 dark:border-brand-500 dark:bg-brand-950/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-3 truncate">
                      <FileText className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {resume.originalFilename}
                        </h4>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {formatFileSize(resume.fileSize)} • {new Date(resume.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {resume.isDefault ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Default
                        </span>
                      ) : (
                        <button
                          title="Set as Default"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDefaultMutation.mutate(resume._id);
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:text-amber-500 transition"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        title="Delete Resume"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this resume?')) {
                            deleteMutation.mutate(resume._id);
                          }
                        }}
                        className="rounded-lg p-1 text-slate-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Parsed Data Inspector */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Parsed Resume Intelligence
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeResume ? activeResume.originalFilename : 'Select a resume to inspect extracted metadata'}
                </p>
              </div>

              {activeResume?.parsedData?.experienceYears !== undefined && (
                <div className="rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-100 dark:border-brand-900">
                  Est. Exp: {activeResume.parsedData.experienceYears} Years
                </div>
              )}
            </div>

            {isResumeLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-xs space-x-2">
                <RefreshCw className="h-5 w-5 animate-spin text-brand-600" />
                <span>Loading parsed resume data...</span>
              </div>
            ) : !activeResume ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No resume selected.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Extracted Skills */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    <Code className="h-4 w-4 text-brand-600" />
                    <span>Extracted Skills ({activeResume.parsedData?.skills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeResume.parsedData?.skills?.length > 0 ? (
                      activeResume.parsedData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No specific tech skills identified.</span>
                    )}
                  </div>
                </div>

                {/* Education */}
                {activeResume.parsedData?.education?.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      <GraduationCap className="h-4 w-4 text-emerald-600" />
                      <span>Education</span>
                    </div>
                    <div className="space-y-2">
                      {activeResume.parsedData.education.map((edu, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800"
                        >
                          <span className="font-bold text-slate-900 dark:text-white block">{edu.degree}</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {edu.institution} {edu.graduationYear ? `(${edu.graduationYear})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects or Experience */}
                {activeResume.parsedData?.projects?.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                      <span>Extracted Projects & Highlights</span>
                    </div>
                    <div className="space-y-2">
                      {activeResume.parsedData.projects.map((proj, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800"
                        >
                          <span className="font-bold text-slate-900 dark:text-white block">{proj.title}</span>
                          <p className="text-slate-600 dark:text-slate-300 mt-1">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
