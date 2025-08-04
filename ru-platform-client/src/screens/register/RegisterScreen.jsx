import { useNavigate } from 'react-router-dom';
import './RegisterScreen.css';
import BackgroundModel from '../../components/background-model/BackgroundModel';
import InputField from '../../components/input/InputField';
import Button from '../../components/button/Button';
import { useState } from 'react';
import PasswordInput from '../../components/inputPassword/inputPassword';
import ProfileButton from '../../components/profileButton/profileButton';
import PdfFileInput from '../../components/pdfFileInput/PdfFileInput';
import { createUser } from '../../services/userServices';

export default function RegisterScreen() {
    const navigate = useNavigate();
    var [selectedProfile, setSelectedProfile] = useState("Aluno");
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        enrollmentNumber: '',
        password: '',
        confirmPassword: '',
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleProfileChange = (value) => {
        setSelectedProfile(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        selectedProfile === 'Servidor' ? selectedProfile = 'teacher' : selectedProfile = 'student';

        const userPayload = {
            name: formData.name,
            mail: formData.email,
            password: formData.password,
            role: selectedProfile,
            [selectedProfile]: {
                enrollmentNumber: formData.enrollmentNumber,
            }
        };

        try {
            await createUser(userPayload);
            alert('Cadastro realizado com sucesso!');
            navigate('/login');
        } catch (error) {
            alert('Erro ao cadastrar usuário: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <BackgroundModel>
            <div className="welcome-register">
                <span className='welcome-register-span'>Cadastre-se</span>
                <ProfileButton
                    firstProfile="Aluno"
                    secondProfile="Servidor"
                    onChange={handleProfileChange}
                />
                <form className="register-form" onSubmit={handleSubmit}>
                    <InputField class="input-field" id='name' placeholder="Digite seu nome completo" label='Nome' type='text' required onChange={handleInputChange} />
                    <InputField class="input-field" id='email' placeholder="Digite seu email" label='E-mail' type='email' required onChange={handleInputChange} />
                    <PasswordInput class="input-field" id='password' placeholder="Digite sua senha aqui" label='Senha' type='password' required onChange={handleInputChange} />
                    <PasswordInput class="input-field" id='confirmPassword' placeholder="Confirme sua senha" label='Confirmar senha' type='password' required onChange={handleInputChange} />
                    <InputField class="input-field" id='enrollmentNumber' placeholder="Digite o número da sua matrícula UPF" label='Matrícula' type='number' required onChange={handleInputChange} />
                    <PdfFileInput id="receipt" label="Anexar comprovante" placeholder="Anexe uma foto do holerite ou comprovante aqui" onChange={() => { }} />
                    <div className='button-container'>
                        <Button type='submit' text='Cadastrar' />
                    </div>
                </form>
            </div>
        </BackgroundModel>
    );
}
