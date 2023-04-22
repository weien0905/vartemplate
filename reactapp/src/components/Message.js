import { FaTimes } from 'react-icons/fa';

const Message = ({ message, success, onClose }) => {
    return (
        <div className={(success) ? "message-success text-padding" : "message text-padding"}>
            {message}
            <span className='times'><FaTimes onClick={onClose} /></span>
        </div>
    );
}

export default Message;