import { useParams } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Vite imports all MDX files in the directory as lazy modules
const notes = import.meta.glob('@/content/notes/*.mdx');

export default function Note() {
    const { noteId } = useParams<{ noteId: string }>();

    // Find the key ending with `/${noteId}.mdx`
    const notePath = `/src/content/notes/${noteId}.mdx`;
    const importNote = notes[notePath];

    if (!importNote) {
        return <div>Note not found</div>;
    }

    // Dynamically load the component
    const NoteContent = lazy(importNote as () => Promise<{ default: React.ComponentType }>);

    return (
        <article className="prose">
            <Suspense fallback={<div>Loading note...</div>}>
                <NoteContent />
            </Suspense>
        </article>
    );
}