import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="layout-wrapper">
            <Navbar />
            <main className="flex-1 pt-16 md:pt-20">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
