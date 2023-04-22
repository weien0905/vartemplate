import { Link } from "react-router-dom";
import { RiAddCircleFill } from "react-icons/ri";
import { useState, useEffect } from "react";
import Message from "./Message";

const Create = () => {
    const [visibility, setVisibility] = useState("Public");
    const [message, setMessage] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(false);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [variables, setVariables] = useState();
    const [subjectDiv, setSubjectDiv] = useState();
    const [contentDiv, setContentDiv] = useState();
    const [doneVariables, setDoneVariables] = useState(false);

    const handleChange = (e) => {
        setVariables({...variables, [e.target.dataset.variable]: e.target.value});
    }

    const createTemplate = (e) => {
        const postTemplate = async () => {
            let token = localStorage.getItem('auth')
            if (!token) {
                setLoading(false);
                setPreview(false);
                setMessage("Not authorised.");
                return;
            }
            
            let res = await fetch('http://localhost:8000/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + JSON.parse(token).access
                },
                body: JSON.stringify({
                    subject: subject,
                    content: content,
                    visbility: visibility
                })
            })

            let data = await res.json()

            if (res.status === 200){
                setLoading(false);
                setSuccess(true);
                setSubject("");
                setContent("");
                setPreview(false);
                setMessage(<>Posted! You can view it on <Link to={`/template/${data.id}`}>here</Link> or continute to create another template.</>);
            } else {
                setLoading(false);
                setPreview(false);
                setMessage("Not authorised.");
            }
        }
        setMessage(null);
        e.preventDefault();
        if (!subject || !content) {
            setSuccess(false);
            setMessage('Please fill in all fields.');
            return;
        }
        setLoading(true);  
        postTemplate();
    }

    // Ensure there is key-value pair in variables
    useEffect(() => {
        let s = subject;
        let c = content;
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
    }, [preview])

    // Text to array of elements
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
                        elems[i] = <input key={i} type="text" size="15" className={variables[variable].length > 0 ? "edit-input-black" : "edit-input-red"} data-variable={variable} placeholder={variable} onChange={handleChange} value={variables[variable]} />
                    }
                }
                return elems;
            }
            setSubjectDiv(textToArray(subject))
            setContentDiv(textToArray(content));
        }
    }, [doneVariables, variables])

    return (
        <>
        <div className="title"><RiAddCircleFill />Create</div>
        <div className="template-tips">
            {(message) && (<Message message={message} success={success} onClose={() => setMessage(null)}/>)}
            <div>
            <span className="vertical-text">Use bracket to indicate variables. Example: <span className="example">{"Dear {Name}, The attachments below are the {Report Name} for {Month}."}</span></span>
            </div>
        </div>
        <div className="template">
            <form onSubmit={createTemplate}>
                {preview ? <><div className="edit-subject">
                {subjectDiv}
            </div>
            <div className="edit-content">
                {contentDiv}
            </div></> : <><div className="create-subject">
                    <input type="text" name="subject" placeholder="Subject" autoComplete="off" onChange={(e) => setSubject(e.target.value)} value={subject} />
                </div>
                <div className="create-content">
                    <textarea rows="10" placeholder="Content" name="content" onChange={(e) => setContent(e.target.value)} value={content}></textarea>
                </div></>}
                <div className="template-options">
                    <div className="flex-btn">
                    <span>
                    <button type="submit" className="btn btn-dark left-btn shadow-none" disabled={(loading) ? true : false}>{"Post"}</button>
                    <span className="text-padding">
                    <select name="visibility" defaultValue={visibility} onChange={(e) => setVisibility(e.target.value)}>
                    <option value="Public">Public</option>
                    <option value="Shareable">Shareable</option>
                    <option value="Private">Private</option>
                    </select> 
                    </span>                 
                    </span>
                    <button type="button" className="btn btn-dark right-btn shadow-none" onClick={() => setPreview(!preview)}>{preview ? "Close preview" : "Open preview"}</button>
                    </div>
                </div>
            </form>
        </div>
        </>
    )
}

export default Create;