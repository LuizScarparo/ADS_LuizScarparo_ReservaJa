import Header from "../header/header";
import Footer from "../footer/footer";
import './MainLayout.css';

export default function MainLayout({ children }) {
    return (
        <>
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </>
    );
}