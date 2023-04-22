import Message from "./Message";
import Terms from "./Terms"
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from "react";
import LogoTitle from './LogoTitle';
import { FaTimes } from "react-icons/fa";

const Box= ({ title, func, message, onClose, loading  }) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [popup, setPopup] = useState();

    const onCancel = () => {
        setPopup(null);
    }

    // Render different content based on pathname
    let div;
    if (pathname === '/signup') {
        let token = localStorage.getItem('auth');
        if (token) {
            // Redirect to home page if user is logged in
            navigate('/');
        }
        div = (<form className="box-form" onSubmit={func}>
        <div className="box-form-field">
            <div><label htmlFor="username">Username</label></div>
            <div><input type="text" name="username" className="input-field" /></div>
        </div>
        <div className="box-form-field">
            <div><label htmlFor="password">Password</label></div>
            <div><input type="password" name="password" className="input-field" /></div>
        </div>
        <div className="box-form-field">
            <div><label htmlFor="password">Retype password</label></div>
            <div><input type="password" name="retypepassword" className="input-field" /></div>
        </div>
        <div className="box-form-field">
            <input type="checkbox" name="checkterms" className='vertical-text'/>
            <label htmlFor="checkterms" className='vertical-text text-padding inline-label'>I agree to the <button className="button-link" type="button" onClick={() => setPopup("terms")}>Terms of use</button> of VarTemplate.</label>
        </div>
        <div className="box-form-field center-text">
            <div><input type="submit" className="submit-btn" value="Sign Up" disabled={(loading) ? true : false} /></div>
        </div> 
    </form>)
    } else if (pathname === '/login') {
        let token = localStorage.getItem('auth');
        if (token) {
            // Redirect to home page if user is logged in
            navigate('/');
        }
        div = (<form className="box-form" onSubmit={func}>
        <div className="box-form-field">
            <div><label htmlFor="username">Username</label></div>
            <div><input type="text" name="username" className="input-field" /></div>
        </div>
        <div className="box-form-field">
            <div><label htmlFor="password">Password</label></div>
            <div><input type="password" name="password" className="input-field" /></div>
        </div>
        <div className="box-form-field center-text">
            <div><input type="submit" className="submit-btn" value="Log In" disabled={(loading) ? true : false} /></div>
        </div> 
    </form>)
    } else if (pathname === '/terms') {
        div = (<>
        <div className='left-text'>
        <Terms />
        </div>
        <div className="center-text">
            <button className="button-link" onClick={() => navigate(-1)}>Back</button>
        </div>
        </>)
    } else {
        div = (<div className="center-text">
            <button className="button-link" onClick={() => navigate("/")}>Go to home page</button>
        </div>)
    }

    return (
        <>
        {popup && <>
        <div className="overlay">
            <div className="popup">
                <div className="close"><FaTimes onClick={onCancel} /></div>
                <div className="content">
                <h2>Terms of Use</h2><Terms />
                </div>
            </div>
        </div>
        </>}
        <LogoTitle />
        <div className="box center-prompt center-text">
            <h2>{title}</h2>
            {(message) && (<Message message={message} onClose={onClose}/>)}
            { div }
        </div>
        </>
    );
}

export default Box;