import { HiStar, HiBookmark } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const TemplateDetails = ({ template }) => {
    const navigate = useNavigate();
    return (
        <div className="template-details" onClick={() => navigate(`/template/${template.id}`)}>
            <div className="template-details-subject">{template["subject"]}</div>
            <div className="template-details-content">{template.content}</div>
            <div className="template-details-info"><HiStar color="gold" />{template.rating} · <HiBookmark color="gold" />{template.saved}</div>
        </div>
    );
}

export default TemplateDetails;