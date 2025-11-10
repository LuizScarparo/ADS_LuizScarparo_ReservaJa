import { useNavigate } from 'react-router-dom';
import './LoginScreen.css';
import { jwtDecode } from "jwt-decode";
import BackgroundModel from '../../components/background-model/BackgroundModel';
import InputField from '../../components/input/InputField';
import Button from '../../components/button/Button';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PasswordInput from '../../components/inputPassword/inputPassword';
import ProfileButton from '../../components/profileButton/profileButton';
import { loginUser } from '../../services/userServices';
import { createUser } from '../../services/userServices';
import { useAuth } from '../../context/authContext';

export default function LoginScreen() {
    const location = useLocation();
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();
    const [selected, setSelected] = useState("UPF");
    const [formData, setFormData] = useState({
        fullName: '',
        mail: '',
        password: '',
    });
    const { login } = useAuth();

    function handleInputChange(e) {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }


    const handleProfileChange = (value) => {
        setSelected(value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selected === "UPF") {
            const payload = {
                mail: formData.mail,
                password: formData.password,
            };
            try {
                const response = await loginUser(payload);
                const token = response.data.token;
                
                if (response.status === 200) {
                    const userData = jwtDecode(token);
                    userData.token = token;
                    login(userData);
                    localStorage.setItem("token", token);
                    navigate('/home');
                }
            } catch (error) {
                alert('Erro ao fazer login: ' + (error.response?.data?.message || error.message));
            }
        }
        else { // É Visitante
            const payload = {
                name: formData.fullName,
                mail: formData.mail,
                role: "visitor"
            };
            try {
                const response = await createUser(payload);
                if (response.status === 201) {
                    const token = response.data.token;
                    const userData = jwtDecode(token);
                    login(userData);
                    navigate('/home');
                }
            } catch (error) {
                alert('Erro ao fazer login como visitante: ' + (error.response?.data?.message || error.message));
            }
        }
    }

    useEffect(() => {
        if (location.state?.fromResetPassword) {
            setShowToast(true);
            window.history.replaceState({}, document.title);
            const id = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(id);
        }
    }, [location.state]);

    return (
        <BackgroundModel>
            {showToast && (
                <div className="toast">
                    Senha alterada com sucesso!
                </div>
            )}
            <div className="welcome-login">
                <span className='welcome-span'>Bem-vindo de volta!</span>
                <span className='make-your-login-span'>Faça seu login</span>
            </div>

            <div className="login-section">
                <ProfileButton
                    firstProfile="UPF"
                    secondProfile="Sou Visitante"
                    onChange={handleProfileChange}
                />
                <form className="login-form" onSubmit={handleSubmit}>
                    {selected === "Sou Visitante" ? (
                        <>
                            <InputField
                                className="input-field"
                                id="fullName"
                                placeholder="Digite seu nome completo"
                                label="Nome Completo"
                                type="text"
                                required
                                onChange={handleInputChange}
                            />
                            <InputField
                                className="input-field"
                                id="mail"
                                placeholder="Digite seu email"
                                label="E-mail"
                                type="email"
                                required
                                onChange={handleInputChange}
                            />
                            <div className='login-button-container'>
                                <Button type='submit' text='Entrar' />
                            </div>
                        </>
                    ) : (
                        <>
                            <InputField
                                className="input-field"
                                id="mail"
                                placeholder="Digite seu email"
                                label="E-mail"
                                type="email"
                                required
                                onChange={handleInputChange}
                            />
                            <PasswordInput
                                className="input-field"
                                id="password"
                                placeholder="Digite sua senha aqui"
                                label="Senha"
                                type="password"
                                required
                                onChange={handleInputChange}
                            />
                            <div className="forgot-password">
                                <span className='forgot-span' onClick={() => navigate('/forgot-password')}>Esqueceu sua senha?</span>
                            </div>
                            <div className='login-button-container'>
                                <Button type='submit' text='Entrar' />
                            </div>
                            <div className="register">
                                <span className='register-question-span'>É da UPF e ainda não possui uma conta?</span>
                                <span className='register-span' onClick={() => navigate('/register')}>Cadastre-se agora!</span>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </BackgroundModel>

    );
}
