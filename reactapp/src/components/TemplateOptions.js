import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Message from "./Message";
import { HiUser, HiLink, HiLockClosed, HiGlobeAlt,  HiStar, HiOutlineStar, HiBookmark } from "react-icons/hi";
import { BiTime } from "react-icons/bi";
import { MdEdit } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import Box from './Box';

const TemplateOptions = ({ user }) => {
    const { pathname } = useLocation();
    const [template, setTemplate] = useState({});
    const [message, setMessage] = useState();
    const [success, setSuccess] = useState();
    const [variables, setVariables] = useState();
    const [subjectDiv, setSubjectDiv] = useState();
    const [contentDiv, setContentDiv] = useState();
    const [doneVariables, setDoneVariables] = useState(false);
    const [popup, setPopup] = useState();
    const [loading, setLoading] = useState(false);
    const [star, setStar] = useState(5);
    const [deleted, setDeleted] = useState(false);
    const [visibility, setVisibility] = useState();
    const [access, setAccess] = useState(true);

    const navigate = useNavigate();
    const params = useParams();

    const starCaption = {
        1: "Bad",
        2: "Unprofessional",
        3: "Normal",
        4: "Good",
        5: "Professional"
    }

    const visibiltyCaption = {
        "Public": "This template can be searched by public.",
        "Shareable": "This template cannot be searched by public but it can be viewed through the shareable link.",
        "Private": "This template can be only viewed by you. Users that saved your template will not be able to view it anymore."
    }

    const onCancel = () => {
        setPopup(null);
        setLoading(false);
    }

    const toText = (div) => {
        let result = [];
        for (let i = 0; i < div.length; i++) {
            if (!(typeof(div[i]) === "string")) {
                result.push(div[i].props.value.trim());
            } else {
                result.push(div[i])
            }
        }
        return result;
    }

    const handleCopy = (e) => {
        let text;
        let item = e.target.dataset.copy;

        if (!Object.values(variables).every(i => i !== "") && !popup) {
            setPopup(`copy-${item}`);
            return;
        }

        if (item === "subject") {
            text = toText(subjectDiv);
        } else {
            text = toText(contentDiv);
        }

        navigator.clipboard.writeText(text.join("")).then(() => {
            setSuccess(true);
            setMessage(`Copied ${item} to clipboard!`);
        }).catch(() => {
            setSuccess(false);
            setMessage("Unable to copy");
        });

        setPopup(null);
    }

    const sendEmail = (e) => {
        if (!Object.values(variables).every(i => i !== "") && !popup) {
            setPopup("email");
            return;
        }

        window.location = `mailto:?subject=${encodeURIComponent(toText(subjectDiv).join(""))}&body=${encodeURIComponent(toText(contentDiv).join(""))}`;
        setPopup(null);
    }

    const onRate = () => {
        const postRate = async () => {
            setLoading(true);

            let token = localStorage.getItem('auth')
            if (!token) {
                setPopup(null);
                setSuccess(false);
                setMessage("Not authorised.");
                setLoading(false);
                return;
            }
            
            let res = await fetch(`http://localhost:8000/api/rate/${params.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + JSON.parse(token).access
                },
                body: JSON.stringify({
                    rating: star
                })
            })

            let data = await res.json()

            if (res.status === 200){
                setSuccess(true);
                setTemplate({...template, rating: data.rating, rating_user: data.rating_user, rated: data.rated})
                setMessage(data.message);
            } else {
                setSuccess(false);
                if (data.error) {
                    setMessage(data.error);
                } else {
                    setMessage("An error occured.");
                } 
            }
            setPopup(null);
            setLoading(false);
        }
        if (!user) {
            navigate(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
        if (!popup) {
            setPopup("rate");
            return;
        }
        postRate();
    }

    const onSave = () => {
        const putSave = async () => {
            setLoading(true);

            let token = localStorage.getItem('auth')
            if (!token) {
                setPopup(null);
                setSuccess(false);
                setMessage("Not authorised.");
                setLoading(false);
                return;
            }

            let res;

            if (!template.saved) {
                res = await fetch(`http://localhost:8000/api/save/${params.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type':'application/json',
                        'Authorization':'Bearer ' + JSON.parse(token).access
                    }
                })
            } else {
                res = await fetch(`http://localhost:8000/api/unsave/${params.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type':'application/json',
                        'Authorization':'Bearer ' + JSON.parse(token).access
                    }
                })
            }

            let data = await res.json()

            if (res.status === 200){
                setSuccess(true);
                setTemplate({...template, save: data.save, saved: data.saved})
                setMessage(data.message);
            } else {
                setSuccess(false);
                if (data.error) {
                    setMessage(data.error);
                } else {
                    setMessage("An error occured.");
                } 
            }
            setPopup(null);
            setLoading(false);
        }
        if (!user) {
            navigate(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
        putSave();
    }

    const changeVisibility = () => {
        const putChangeVisibility = async () => {
            setLoading(true);

            let token = localStorage.getItem('auth')
            if (!token) {
                setPopup(null);
                setSuccess(false);
                setMessage("Not authorised.");
                setLoading(false);
                return;
            }
            
            let res = await fetch(`http://localhost:8000/api/change-visibility/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + JSON.parse(token).access
                },
                body: JSON.stringify({
                    visibility: visibility
                })
            })

            let data = await res.json()

            if (res.status === 200){
                setSuccess(true);
                setTemplate({...template, visibility: data.visibility});
                setMessage(data.message);
            } else {
                setSuccess(false);
                if (data.error) {
                    setMessage(data.error);
                } else {
                    setMessage("An error occured.");
                } 
            }
            setPopup(null);
            setLoading(false);
        }
        if (!popup) {
            setPopup("visibility");
            return;
        }
        putChangeVisibility();
    }

    const deleteTemplate = () => {
        const onDelete = async () => {
            setLoading(true);

            let token = localStorage.getItem('auth')
            if (!token) {
                setPopup(null);
                setSuccess(false);
                setMessage("Not authorised.");
                setLoading(false);
                return;
            }
            
            let res = await fetch(`http://localhost:8000/api/delete/${params.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + JSON.parse(token).access
                }
            })

            let data = await res.json()

            if (res.status === 200){
                setDeleted(true);
            } else {
                setSuccess(false);
                if (data.error) {
                    setMessage(data.error);
                } else {
                    setMessage("An error occured.");
                } 
            }
            setPopup(null);
            setLoading(false);
        }
        if (!popup) {
            setPopup("delete");
            return;
        }
        onDelete()
    }

    // Get template and ensure there is key-value pair in variables
    useEffect(() => {
        const get_template = async () => {
            let token = localStorage.getItem('auth')
            let res;
            let data;
            let ok = false;

            if (pathname === '/') {
                data = {
                    "subject": "Welcome {Receiver Name}",
                    "content": "Dear {Receiver Name},\n\nWelcome to VarTemplate!\n\nYou may start to edit this template by entering text in the variables. Other than that, you may also search or even create your own template and share it to others.\n\nBest regards,\n{Sender Name}"
                }
                ok = true;
            } else {
                if (token) {
                    res = await fetch(`http://localhost:8000/api/template/${params.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type':'application/json',
                            'Authorization':'Bearer ' + JSON.parse(token).access
                        },
                    });
                } else {
                    res = await fetch(`http://localhost:8000/api/template/${params.id}`);
                }
                data = await res.json();
                
                if (res.status === 200) {
                    ok = true;
                } else if (res.status === 403) {
                    setAccess(false);
                } else {
                    navigate('/error');
                }  
            }    

            if (ok) {
                let s = data.subject;
                let c = data.content;
                setTemplate(data);
                let v = {};
                s = s.split(/(\{.*?\})/);
                c = c.split(/(\{.*?\})/);
    
                for (let i = 0; i < s.length; i++) {
                    if (s[i].startsWith("{") && s[i].endsWith("}")) {
                        const variable = s[i].slice(1, -1).trim();
                        v[variable] = ""
                    }
                }
                for (let i = 0; i < c.length; i++) {
                    if (c[i].startsWith("{") && c[i].endsWith("}")) {
                        const variable = c[i].slice(1, -1).trim();
                        v[variable] = ""
                    }
                }
                setVariables(v);
                setDoneVariables(true);
            } 
        }
        get_template();
    }, [])

    // Convert text to array of elements
    useEffect(() => {
        if (doneVariables) {
            const textToArray = (text) => {
                let elems;
                elems = text.split(/(\{.*?\})/);
                let v = {};
                for (let i = 0; i < elems.length; i++) {
                    if (elems[i].startsWith("{") && elems[i].endsWith("}")) {
                        const variable = elems[i].slice(1, -1).trim();
                        v[variable] = "";
                        elems[i] = <input key={i} type="text" size={Math.max(15, variable.length)} className={variables[variable].length > 0 ? "edit-input-black" : "edit-input-red"} data-variable={variable} placeholder={variable} onChange={(e) => setVariables({...variables, [e.target.dataset.variable]: e.target.value})} value={variables[variable]} />
                    }
                }
                return elems;
            }
            setSubjectDiv(textToArray(template.subject));
            setContentDiv(textToArray(template.content));
            setVisibility(template.visibility);
        }
    }, [doneVariables, variables])
    
    return (
        deleted ? <Box title="Template deleted" /> : 
        !access ? <Box title="You have no access to this template" /> :
        <>{popup && 
        <div className="overlay">
            <div className="popup">
                <div className="close"><FaTimes onClick={onCancel} /></div>
                <div className="content">
                    {popup === "rate" && <><h2 onClick={() => {setStar(star - 1)}}>Rate</h2>
                    <div className="rate center-text">
                    <span className="star" data-star="1" onClick={(e) => setStar(parseInt(e.currentTarget.dataset.star))}>{star >= 1 ? <HiStar /> : <HiOutlineStar />}</span>
                    <span className="star" data-star="2" onClick={(e) => setStar(parseInt(e.currentTarget.dataset.star))}>{star >= 2 ? <HiStar /> : <HiOutlineStar />}</span>
                    <span className="star" data-star="3" onClick={(e) => setStar(parseInt(e.currentTarget.dataset.star))}>{star >= 3 ? <HiStar /> : <HiOutlineStar />}</span>
                    <span className="star" data-star="4" onClick={(e) => setStar(parseInt(e.currentTarget.dataset.star))}>{star >= 4 ? <HiStar /> : <HiOutlineStar />}</span>
                    <span className="star" data-star="5" onClick={(e) => setStar(parseInt(e.currentTarget.dataset.star))}>{star >= 5 ? <HiStar /> : <HiOutlineStar />}</span>
                    </div>
                    <div className="center-text">{starCaption[star]}</div>
                    <div className="center-text ok-btn"><button type="button" className="btn shadow-none btn-dark right-btn" onClick={onRate}>Rate</button></div></>}
                    {popup === "copy-subject" && <><div>
                    There are empty fields. Are you sure to continue?
                    <div className="center-text ok-btn"><button type="button" className="btn shadow-none btn-dark right-btn" data-copy="subject" onClick={handleCopy}>Continue</button></div>
                    </div></>}
                    {popup === "copy-content" && <><div>
                    There are empty fields. Are you sure to continue?
                    <div className="center-text ok-btn"><button type="button" className="btn shadow-none btn-dark right-btn" data-copy="content" onClick={handleCopy}>Continue</button></div>
                    </div></>}
                    {popup === "email" && <><div>
                    There are empty fields. Are you sure to continue?
                    <div className="center-text ok-btn"><button type="button" className="btn shadow-none btn-dark right-btn" onClick={sendEmail}>Continue</button></div>
                    </div></>}
                    {popup === "visibility" && <><div>
                    <h2>Change visibility</h2>
                    <div>
                    <select name="visibility" defaultValue={template.visibility} onChange={(e) => setVisibility(e.target.value)}>
                    <option value="Public">Public</option>
                    <option value="Shareable">Shareable</option>
                    <option value="Private">Private</option>
                    </select>
                    </div>
                    <div>{visibiltyCaption[visibility]}</div>
                    <div className="center-text ok-btn"><button type="button" className="btn shadow-none btn-dark right-btn" onClick={changeVisibility}>Confirm</button></div>
                    </div></>}
                    {popup === "delete" && <><div>
                    This action cannot be undone. Users that saved your template will not be able to view it anymore. Are you sure to continue?
                    <div className="center-text ok-btn"><button type="button" className="btn shadow-none btn-danger right-btn" onClick={deleteTemplate}>Delete</button></div>
                    </div></>}
                </div>
            </div>
        </div>}
        <div className="title"><MdEdit />{pathname === '/' ? 'Try to Edit' : 'Edit'}</div>
        <div className="template-tips">
            {(message) && (<Message message={message} success={success} onClose={() => setMessage(null)}/>)}
            <div>
            <span className="vertical-text">Edit and copy to clipboard or send through email.</span>
            </div>
        </div>
        <div className="template">
            <div className="edit-subject">
                {subjectDiv}
            </div>
            <div className="edit-content">
                {contentDiv}
            </div>
            <div className="template-options">
                <div className="flex-btn">
                <button className="btn btn-dark shadow-none" data-copy="subject" onClick={handleCopy}>Copy subject</button>
                <button className="btn btn-dark shadow-none" data-copy="content" onClick={handleCopy}>Copy content</button>
                <button className="btn btn-dark shadow-none" onClick={sendEmail}>Send email</button>
                </div>
            </div>
        </div>
        {
            pathname !== '/' &&
            <div>
                <div>
                    <div><HiUser /><span className="vertical-text">{template.owner}</span></div>
                    <div><BiTime /><span className="vertical-text">{template.date}</span></div>
                    <div>
                        {template.visibility === 'Public' && <HiGlobeAlt />}
                        {template.visibility === 'Shareable' && <HiLink />}
                        {template.visibility === 'Private' && <HiLockClosed />}
                        <span className="vertical-text">{template.visibility}</span>
                    </div>
                    <div><HiStar /><span className="vertical-text">{template.rating} ({template.rating_user}){!template.rated && <button className="button-link text-padding" onClick={onRate} disabled={(loading) ? true : false}>Rate</button>}</span></div>
                    <div><HiBookmark /><span className="vertical-text">{template.save}<button className="button-link text-padding" onClick={onSave} disabled={(loading) ? true : false}>{template.saved ? 'Unsave' : 'Save'}</button></span></div>
                </div>
            </div> 
        }
        {template.is_owner && <div className="template-owner-actions">
            <button className="btn btn-dark shadow-none" onClick={changeVisibility}>Change visibility</button>
            <button className="btn btn-danger shadow-none" onClick={deleteTemplate}>Delete template</button>
        </div>}
        </>
    );
}

export default TemplateOptions;