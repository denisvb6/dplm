import { useState, useRef } from 'react';

import { useUser } from '../../UserContext/UserContext';
import { Layout } from '../Layout/Layout';
import { ProductInput } from '../ProductInput/ProductInput';
import { ProductButton } from '../ProductButton/ProductButton';

import styles from './LoginForm.module.css';


const LoginForm = () => {
    // const { setCurrentUser } = useUser();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const buttonRef = useRef();
    const usernameRef = useRef();
    const passwordRef = useRef();

    const { login } = useUser();

    const loginForm = async (event) => {
        event.preventDefault();
        
        try {
            await login(username, password);
            setUsername('');
            setPassword('');
            // при необходимости navigate('/')
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <form className={styles['loginForm']} onSubmit={loginForm}>
            <Layout />

            <h1 className={styles['loginHeading']}>Вход</h1>

            <ProductInput
                type="text"
                ref={usernameRef}
                value={username}
                placeholder="Имя пользователя..."
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <ProductInput
                type="password"
                ref={passwordRef}
                value={password}
                placeholder="Пароль..."
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <ProductButton type="submit" ref={buttonRef}>
                Войти в профиль
            </ProductButton>
        </form>
    );
};

export { LoginForm };
