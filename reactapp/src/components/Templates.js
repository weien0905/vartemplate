import { HiSearch, HiBookmark, HiTemplate } from "react-icons/hi";
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import TemplateDetails from './TemplateDetails';
import Loading from './Loading';
import SearchBar from "./SearchBar";

const Templates = () => {
    const { pathname } = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);

        if (pathname === '/your-templates' || pathname === '/saved-templates') {
            let token = localStorage.getItem('auth')
            if (!token) {
                navigate('/error');
            }
            const get_template = async () => {
                let res = await fetch(`http://localhost:8000/api${pathname}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type':'application/json',
                        'Authorization':'Bearer ' + JSON.parse(token).access
                    }
                })
                let data = await res.json();

                if (res.status === 200) {
                    setTemplates(data.templates);
                    setLoading(false);
                } else {
                    navigate("/error");
                }              
            }
            get_template();
        }

        else if (pathname === '/search-results') {
            if (!searchParams.get("q")) {
                navigate("/error");
            }  else {
                const search_template = async () => {
                    let res = await fetch(`http://localhost:8000/api/search-results?q=${searchParams.get("q")}`)
                    let data = await res.json();

                    if (res.status === 200) {
                        setTemplates(data.templates);
                        setLoading(false);
                    } else {
                        navigate("/error");
                    }  
                }
                search_template();
            }
        }
    }, [pathname, searchParams]);

    let title;
    if (pathname === '/saved-templates') {
        title = (<div className="title"><HiBookmark />Saved templates</div>);
    } else if (pathname === '/your-templates') {
        title = (<div className="title"><HiTemplate />Your templates</div>);
    } else if (pathname === '/search-results') {
        title = (<div className="title"><HiSearch />Search results for "{searchParams.get("q")}"</div>);
    }

    return (
        loading ? <Loading /> : 
        (<div>{title}
            {(pathname === '/search-results') && <SearchBar />}
            {templates.length > 0 ? templates.slice((page - 1) * 10, (page * 10)).map((template) => 
            (<TemplateDetails key={template.id} template={template} />)
            ) : <div>No templates to show</div>}
            {templates.length > 0 && <div className="pagination-box">
            <ul className="pagination">
                <li className={page === 1 ? "page-item disabled" : "page-item"}>
                    <button className="page-link" onClick={() => setPage(page - 1)}>&lt;</button>
                </li>
                {page - 2 >= 1 && <li className="page-item">
                    <button className="page-link" onClick={() => setPage(page - 2)}>{page - 2}</button>
                </li>}
                {page - 1 >= 1 && <li className="page-item">
                    <button className="page-link" onClick={() => setPage(page - 1)}>{page - 1}</button>
                </li>}
                <li className="page-item active">
                    <span className="page-link">{page}</span>
                </li>
                {page + 1 <= Math.floor((templates.length - 1) / 10) + 1 && <li className="page-item">
                    <button className="page-link" onClick={() => setPage(page + 1)}>{page + 1}</button>
                </li>}
                {page + 2 <= Math.floor((templates.length - 1) / 10) + 1 && <li className="page-item">
                    <button className="page-link" onClick={() => setPage(page + 2)}>{page + 2}</button>
                </li>}
                <li className={page === Math.floor((templates.length - 1) / 10) + 1 ? "page-item disabled" : "page-item"}>
                    <button className="page-link" onClick={() => setPage(page + 1)}>&gt;</button>
                </li>
            </ul>
            </div>}
        </div>)
    );
}

export default Templates;