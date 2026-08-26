import { useParams } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Vite imports all MDX files in the directory as lazy modules
const posts = import.meta.glob('@/content/*.mdx');

export default function Post() {
    const { postId } = useParams<{ postId: string }>();

    // Find the key ending with `/${postId}.mdx`
    const postPath = `/src/content/${postId}.mdx`;
    const importPost = posts[postPath];

    if (!importPost) {
        return <div>Post not found</div>;
    }

    // Dynamically load the component
    const PostContent = lazy(importPost as () => Promise<{ default: React.ComponentType }>);

    return (
        <article className="prose">
            <Suspense fallback={<div>Loading post...</div>}>
                <PostContent />
            </Suspense>
        </article>
    );
}