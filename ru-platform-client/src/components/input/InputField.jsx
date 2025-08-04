import { useState } from 'react';
import './InputField.css';
import { FiEye, FiEyeOff } from 'react-icons/fi'

const InputField = ({ id, label, type = 'text', required, onChange, ...rest }) => {
    const [visible, setVisible] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword 
      ? (visible ? 'text' : 'password') 
      : type
    return (
        <div className="input-field-container">
            <label htmlFor={id} className="input-label">{label}</label>
            <input
                type={type}
                id={id}
                name={id}
                required={required}
                onChange={onChange}
                className="input-field"
                {...rest}
            />
        </div>
    );
};

export default InputField;
