import styles from './VegetablesPage.module.css';
import { useState } from 'react';
import { Menu } from '../Menu/Menu';
import { Input } from '../Input/Input';
import { VegetablesList } from '../VegetablesList/VegetablesList';

export const VegetablesPage = () => {
    const [search, setSearch] = useState('');

    return (
        <div className="app">
            <Menu />

            <div className={styles['vegetablesPage']}>
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск товара..."
                />

                <VegetablesList search={search} />
            </div>
        </div>
    );
};
