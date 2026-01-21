import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-dark-950 text-dark-900 dark:text-white">
            <Navbar />
            <main className="flex-1 pt-16 md:pt-20">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
