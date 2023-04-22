import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer>
            <div>Copyright &copy; 2023 - <a href="https://github.com/weien0905">weien0905</a></div>
            <Link to="/terms">Terms of use</Link>
        </footer>
    );

}

export default Footer;