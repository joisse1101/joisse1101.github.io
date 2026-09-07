import { CardCarousel } from "@joisse1101/ui-library";
import "@/styles/page_home.scss";
import { Link } from "react-router";

const postPaths = Object.keys(import.meta.glob('@/content/posts/*.mdx', { eager: false }));
const notePaths = Object.keys(import.meta.glob('@/content/notes/*.mdx', { eager: false }));

const getNames = (paths: string[]) =>
    paths.map(path => path.split('/').pop()?.replace(/\.mdx$/, '')).filter((name): name is string => name !== undefined);

export default function Home() {
    return (
        <div className="app-wrapper">
            <CardCarousel items={[
                {
                    id: 1,
                    title: "The Goal Tracker",
                    description: "Because who doesn't have a dream?",
                    image: "https://images.unsplash.com/photo-1569230919100-d3fd5e1132f4?auto=format&fit=crop&w=600&q=80",
                    link: {
                        label: "View Project",
                        url: "/qol/goal-tracker"
                    }
                },
                {
                    id: 2,
                    title: "Granny Square",
                    description: "Figuring out how to make the perfect granny square blanket.",
                    image: "https://images.unsplash.com/vector-1788008515126-92f655ae8d21?auto=format&fit=crop&w=600&q=80",
                    link: {
                        label: "View Project",
                        url: "/qol/granny-square"
                    }
                },
                {
                    id: 3,
                    title: "UI Library",
                    description: "A collection of components for myself in a very pink theme.",
                    image: "https://images.unsplash.com/vector-1788475310590-fa66f77f8f3a?auto=format&fit=crop&w=600&q=80",
                    link: {
                        label: "View Project",
                        url: "/ui-library"
                    }
                },
                {
                    id: 4,
                    title: "Susan And Gloria",
                    description: "Companions, when it's a bit too quiet. Coming soon...",
                    image: "https://images.unsplash.com/vector-1786544532500-9f622a3d4aa1?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    // link: {
                    //     label: "To be continued...",
                    //     url: "/"
                    // }
                }
            ]} isInfinite={true} />
            <div className="link-section">
                <div className="link-container">
                    <h3>Posts</h3>
                    {getNames(postPaths).map(postName => (
                        <Link to={`/posts/${postName}`} key={postName}>{postName}</Link>
                    ))}
                </div>
                <div className="link-container">
                    <h3>Notes</h3>
                    {getNames(notePaths).map(noteName => (
                        <Link to={`/notes/${noteName}`} key={noteName}>{noteName}</Link>
                    ))}
                </div>
            </div>
        </div>
    );
}