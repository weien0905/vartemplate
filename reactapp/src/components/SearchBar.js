import { HiSearch } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const navigate = useNavigate();   
    
    const search = (e) => {
        e.preventDefault(); 

        if (e.target.q.value) {
            navigate(`/search-results?q=${e.target.q.value}`)
        }
    }

    return (
        <form onSubmit={search} className='search-bar'>
            <input type="text" className='search-input vertical-text' autoComplete="off" placeholder="Search" name="q" />
            <button type="submit" className='search-button'><HiSearch /></button>
        </form>
);
}

export default SearchBar;