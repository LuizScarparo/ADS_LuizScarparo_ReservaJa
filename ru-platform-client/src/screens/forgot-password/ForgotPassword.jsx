import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import BackgroundModel from '../../components/background-model/BackgroundModel';
import InputField from '../../components/input/InputField';
import Button from '../../components/button/Button';
import { useState } from 'react';
import { requestPasswordReset } from '../../services/userServices';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        mail: '',
    });

    function handleInputChange(e) {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault

        const payload = {
            mail: formData.mail,
        };

        try {
            const response = await requestPasswordReset(payload);
            if (response.status === 200) {
                navigate('/forgot-password-feedback');
            }
        } catch (error) {
            alert('Erro ao solicitar redefinição de senha: ' + (error.response?.data?.message || error.message));
        };
    }
    return (
        <BackgroundModel>
            <div className="welcome-forgot-password">
                <span className='welcome'>Olá!</span>
                <span className='forgot-password-span'>Para recuperarmos sua senha confirme seu e-mail e iremos enviar um link para redefinição</span>
            </div>
            <form className="forgot-password-form" onSubmit={(e) => e.preventDefault()}>
                <InputField class="input-field" id='mail' placeholder="Digite seu email" label='E-mail' type='email' required onChange={handleInputChange} />
                <div className='button-container'>
                    <Button type="submit" text="Enviar" onClick={handleSubmit} />
                </div>
            </form>
        </BackgroundModel>
    );
}
