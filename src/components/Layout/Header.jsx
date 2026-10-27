import { NavLink, useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { useUser } from '../../UserContext/UserContext';
import productStoreIcon from '../../assets/productStoreIcon.png';
import exitIcon from '../../assets/exitIcon.png';

import styles from './Header.module.css';

export const Header = () => {
    const { currentUser, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = async (event) => {
        event.preventDefault();
        await logout();          // чистит httpOnly-cookie на сервере и состояние
        navigate('/');
    };

    return (
        <nav className={cn(styles['layout'])}>
            <div>
                <img
                    src={productStoreIcon}
                    alt="Значок магазина еды"
                    className={cn(styles['productStoreIcon'])}
                />
            </div>

            <ul className={cn(styles['list'])}>
                {currentUser && (
                    <li className={cn(styles['username'])}>
                        {currentUser.username}
                        {currentUser.role === 'admin' && ' (админ)'}
                    </li>
                )}

                <li>
                    {currentUser ? (
                        <NavLink
                            to="/"
                            onClick={handleLogout}
                            className={({ isActive }) =>
                                cn(styles['navlink'], { [styles['active']]: isActive })
                            }
                        >
                            Выйти
                        </NavLink>
                    ) : (
                        <NavLink
                            to="/login"
                            className={({ isActive }) =>
                                cn(styles['navlink'], { [styles['active']]: isActive })
                            }
                        >
                            Войти
                        </NavLink>
                    )}

                    <span>/</span>

                    <NavLink
                        to="/registration"
                        className={({ isActive }) =>
                            cn(styles['navlink'], { [styles['active']]: isActive })
                        }
                    >
                        Регистрация
                    </NavLink>
                </li>

                <NavLink to="/">
                    <img
                        src={exitIcon}
                        alt="Значок Выйти на главную страницу"
                        className={cn(styles['exitIcon'])}
                    />
                </NavLink>
            </ul>
        </nav>
    );
};