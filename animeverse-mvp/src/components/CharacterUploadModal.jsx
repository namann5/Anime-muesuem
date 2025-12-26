import React, { useState } from 'react';
import { uploadCharacter } from '../services/characterService';

export default function CharacterUploadModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        series: '',
        role: ''
    });
    const [modelFile, setModelFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
                setError('Please select a .glb or .gltf file');
                return;
            }
            setModelFile(file);
            setError('');
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!modelFile) {
            setError('Please select a 3D model file');
            return;
        }
        if (!formData.name.trim()) {
            setError('Character name is required');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const result = await uploadCharacter(
                modelFile,
                formData,
                (progress) => setUploadProgress(Math.round(progress))
            );

            // Success!
            console.log('Character uploaded:', result);
            if (onSuccess) onSuccess(result);

            // Reset form
            setFormData({ name: '', description: '', series: '', role: '' });
            setModelFile(null);
            setUploadProgress(0);
            onClose();
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload character');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-xl border border-anime-pink/30 bg-anime-dark p-6 shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-2xl text-white/60 transition-colors hover:text-white"
                    disabled={uploading}
                >
                    ×
                </button>

                {/* Header */}
                <h2 className="mb-6 bg-gradient-anime bg-clip-text text-2xl font-bold text-transparent">
                    Add New Character
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Character Name */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-white">
                            Character Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Son Goku"
                            className="w-full rounded-lg border border-anime-pink/30 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-anime-pink focus:outline-none focus:ring-2 focus:ring-anime-pink/50"
                            disabled={uploading}
                            required
                        />
                    </div>

                    {/* Series/Anime */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-white">
                            Series/Anime
                        </label>
                        <input
                            type="text"
                            name="series"
                            value={formData.series}
                            onChange={handleInputChange}
                            placeholder="e.g., Dragon Ball Z"
                            className="w-full rounded-lg border border-anime-pink/30 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-anime-pink focus:outline-none focus:ring-2 focus:ring-anime-pink/50"
                            disabled={uploading}
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-white">
                            Role/Type
                        </label>
                        <input
                            type="text"
                            name="role"
                            value={formData.role}
                            placeholder="e.g., Protagonist, Villain"
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-anime-pink/30 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-anime-pink focus:outline-none focus:ring-2 focus:ring-anime-pink/50"
                            disabled={uploading}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-white">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Brief character bio..."
                            rows={3}
                            className="w-full rounded-lg border border-anime-pink/30 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-anime-pink focus:outline-none focus:ring-2 focus:ring-anime-pink/50"
                            disabled={uploading}
                        />
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-white">
                            3D Model File (.glb or .gltf) *
                        </label>
                        <input
                            type="file"
                            accept=".glb,.gltf"
                            onChange={handleFileChange}
                            className="w-full rounded-lg border border-anime-pink/30 bg-white/5 px-4 py-2 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-gradient-anime file:px-4 file:py-1 file:text-sm file:font-medium file:text-anime-dark hover:file:bg-anime-pink-light"
                            disabled={uploading}
                            required
                        />
                        {modelFile && (
                            <p className="mt-1 text-xs text-anime-muted">
                                Selected: {modelFile.name} ({(modelFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="space-y-2">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full bg-gradient-anime transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-center text-sm text-anime-muted">
                                Uploading... {uploadProgress}%
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="flex-1 rounded-lg border border-anime-pink/30 bg-white/5 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 rounded-lg bg-gradient-anime px-4 py-2 font-bold text-anime-dark shadow-lg shadow-anime-pink/30 transition-all hover:-translate-y-0.5 hover:shadow-anime-pink/50 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {uploading ? 'Uploading...' : 'Upload Character'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
