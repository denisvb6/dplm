import { Outlet } from 'react-router-dom';
import cn from 'classnames';
import { Header } from './Header'; 
import styles from './Layout.module.css';

export const Layout = () => {
    return (
        <div className={cn(styles['page'])}>
            <div className={cn(styles['container'])}>

                <Header />

                <div className={cn(styles['outlet'])}>
                    <Outlet />
                </div>

            </div>
        </div>
    );
};