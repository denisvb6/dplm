// import { Layout } from '../Layout/Layout';
import styles from './Menu.module.css';
import { Link } from 'react-router-dom';

export const Menu = () => {
    return (
        <div className={styles['menu']}>
            <div className={styles['leftpanel']}>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Овощи</Link>
                        </li>

                        <li>
                            <Link to="/drinks">Напитки</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};
