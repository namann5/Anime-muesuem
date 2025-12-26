import React from 'react';

export default function CharacterCardGrid({ characters, onSelectCharacter, isAdmin, onDeleteCharacter }) {
    if (characters.length === 0) {
        return (
            <div className="p-8 text-center">
                <p className="text-anime-muted">No characters in gallery yet</p>
                {isAdmin && (
                    <p className="mt-2 text-sm text-anime-muted">
                        Click "Add Character" to upload your first character
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {characters.map((character) => (
                <div
                    key={character.id}
                    className="group relative overflow-hidden rounded-xl border border-anime-pink/20 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition-all duration-300 hover:border-anime-pink/50 hover:shadow-lg hover:shadow-anime-pink/20"
                    onClick={() => onSelectCharacter && onSelectCharacter(character)}
                    style={{ cursor: 'pointer' }}
                >
                    {/* Thumbnail or Placeholder */}
                    <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-white/5">
                        {character.thumbnailUrl ? (
                            <img
                                src={character.thumbnailUrl}
                                alt={character.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <svg
                                    className="h-16 w-16 text-anime-pink/30"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Character Info */}
                    <h3 className="mb-2 bg-gradient-anime bg-clip-text text-lg font-bold text-transparent">
                        {character.name}
                    </h3>

                    {character.series && (
                        <p className="mb-1 text-sm text-anime-muted">
                            <span className="text-white/60">Series:</span> {character.series}
                        </p>
                    )}

                    {character.role && (
                        <p className="mb-1 text-sm text-anime-muted">
                            <span className="text-white/60">Role:</span> {character.role}
                        </p>
                    )}

                    {character.description && (
                        <p className="mt-2 line-clamp-2 text-xs text-white/50">
                            {character.description}
                        </p>
                    )}

                    {/* Hover indicator */}
                    <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="rounded-full bg-anime-pink/20 p-2">
                            <svg
                                className="h-4 w-4 text-anime-pink"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Delete button for admin */}
                    {isAdmin && onDeleteCharacter && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete ${character.name}?`)) {
                                    onDeleteCharacter(character.id);
                                }
                            }}
                            className="absolute bottom-2 right-2 rounded-lg bg-red-500/20 p-2 opacity-0 transition-opacity hover:bg-red-500/30 group-hover:opacity-100"
                            title="Delete character"
                        >
                            <svg
                                className="h-4 w-4 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
