import Logo from './logo512.png';

const LogoTitle = () => {
    return (
        <div className='center-text margin-div'>
        <div><img id="box-logo" src={Logo} alt="VarTemplate Logo" /><span className='logo-title vertical-text'>VarTemplate</span></div>
        <div>Create, search and edit templates easily</div>
        </div>
    );
}

export default LogoTitle;