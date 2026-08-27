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
                    title: "QoL",
                    description: "Modding reality with a touch of code.",
                    image: "/projects/QoL.png",
                    link: {
                        label: "View Project",
                        url: "/qol"
                    }
                },
                {
                    id: 2,
                    title: "Susan And Gloria",
                    description: "Companions, when it's a bit too quiet.",
                },
                {
                    id: 3,
                    title: "Something New",
                    description: "Coming soon...",
                },
                {
                    id: 4,
                    title: "Something New",
                    description: "Coming soon...",
                },
                {
                    id: 5,
                    title: "Something New",
                    description: "Coming soon...",
                },

            ]} />
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