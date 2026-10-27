import { useState } from 'react';
import { Menu } from '../Menu/Menu';
import { Input } from '../Input/Input';
import { DrinksList } from '../DrinksList/DrinksList';

export const DrinksPage = () => {
    const [search, setSearch] = useState('');

    return (
        <div className="app">
            <Menu />

            <div className="drinksPage">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск напитка..."
                />

                <DrinksList search={search} />
            </div>
        </div>
    );
};