import './Button.css';

export default function Button({type, text, ...rest}) {
    return (
        <div>
            <button 
                type={type} 
                className='button-component'
                {...rest}
                >{text}</button>
        </div>
    )
}