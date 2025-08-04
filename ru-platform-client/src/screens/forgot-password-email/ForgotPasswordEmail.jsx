import './ForgotPasswordEmail.css';
import BackgroundModel from '../../components/background-model/BackgroundModel';

export default function ForgotPasswordMail() {
    return (
        <BackgroundModel>
            <div className="feedback-message">
                <span className='feedback-title'>Quase tudo pronto!</span>
                <span className='feedback-description'>Enviamos um link de recuperação de senha no e-mail fornecido, clique para continuar
                    o processo de troca.</span>
            </div>
        </BackgroundModel>
    );
}

