import { Outlet } from 'react-router-dom';
import { Header } from '@joisse1101/ui-library';
import { Footer } from '@joisse1101/ui-library';

export function MainLayout() {
    return (
        <div className="layout">
            <Header/>
            <main>
                <Outlet /> {/* Child routes render here */}
            </main>

            <Footer />
        </div>
    );
}