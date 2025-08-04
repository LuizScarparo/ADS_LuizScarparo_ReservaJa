import { useNavigate } from 'react-router-dom';
import './ChangePassword.css';
import BackgroundModel from '../../components/background-model/BackgroundModel';
import Button from '../../components/button/Button';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import PasswordInput from '../../components/inputPassword/inputPassword';
import { resetPassword } from '../../services/userServices';

export default function ChangePassword() {
    const { userId, token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem');
            return;
        }

        try{
            const response = await resetPassword(userId, token, newPassword);
            if (response.status === 200) {
                alert('Senha alterada com sucesso');
                navigate('/login', {state: { fromResetPassword: true }});
            }
        }
        catch (error) {
            alert('Erro ao alterar a senha: ' + (error.response?.data?.message || error.message));
        };
      };

    return (
        <BackgroundModel>
                <div className="change-content">
                    <span className='change-title'>Alterar senha</span>
                    <span className='change-description'>Agora você pode criar sua nova senha, mas lembrando:</span>
                    <span className='change-description-bold'>Ela deve conter no mínimo 8 caracteres</span>
                </div>
                <form className="change-password-form" onSubmit={handleSubmit}>
                    <PasswordInput className="input-field" id='password' placeholder="Digite sua nova senha aqui" label='Nova senha' type='password' required onChange={(e) => setNewPassword(e.target.value)} />
                    <PasswordInput className="input-field" id='passwordConfirm' placeholder="Confirme sua senha" label='Confirme a nova senha' type='password' required  onChange={(e) => setConfirmPassword(e.target.value)} />
                    <div className='button-container'>
                        <Button type='submit' text='Confirmar' onClick={handleSubmit}/>
                    </div>
                </form>
        </BackgroundModel>
    );
}
