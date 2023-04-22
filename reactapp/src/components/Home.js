import { HiSearch } from "react-icons/hi";
import { RiAddCircleFill } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import LogoTitle from './LogoTitle';
import SearchBar from './SearchBar';
import TemplateOptions from './TemplateOptions';

const Home = () => {
    return (
        <div>
            <LogoTitle />
            <div className="home-search">
                <SearchBar />
            </div>
            <div className="intro">
            <div className="row">
                <div className="intro-outer col-lg-4"><div className="intro-inner">
                    <div className="intro-title">
                    <HiSearch />
                    <span className="text-padding">Search templates</span>
                    </div>
                    <div className="justify-text">Search your template based on keyword from our database.</div>
                </div></div>
                <div className="intro-outer col-lg-4"><div className="intro-inner">
                    <div className="intro-title">
                    <RiAddCircleFill />
                    <span className="text-padding">Create templates</span>
                    </div>
                    <div className="justify-text">If you can't find a template that is suitable for you, just create a new one and choose to set it as private, shareable or public template! Other users can search or view your template depending on the visibility settings.</div>
                </div></div>
                <div className="intro-outer col-lg-4"><div className="intro-inner">
                    <div className="intro-title">
                    <MdEdit />
                    <span className="text-padding">Edit templates</span>
                    </div>
                    <div className="justify-text">Once you have decided your template, you can edit it by entering the text for each variable. After editing, just copy the email or send it through email with pre-filled subject and body!</div>
                </div></div>
            </div>
            </div>
            <TemplateOptions />  
        </div>
    );
}

export default Home;