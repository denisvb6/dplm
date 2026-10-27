import { ProductCard } from '../ProductCard/ProductCard';
import styles from './DrinksList.module.css';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Button } from '../Button/Button';

export function DrinksList({ search = '' }) {
    const [products, setProducts] = useState([]);
    const [sortAscending, setSortAscending] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        const loadDrinks = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(
                    '/api/products',
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error('Не удалось загрузить напитки');
                }

                const data = await response.json();

                const drinks = data.filter(
                    (product) => product.type === 'drinks'
                );

                setProducts(drinks);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Ошибка загрузки напитков:', err);
                    setError('Не удалось загрузить напитки. Проверьте соединение с сервером.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadDrinks();

        return () => controller.abort();
    }, [reloadKey]);

    const sortByPrice = () => {
        setProducts((currentProducts) =>
            [...currentProducts].sort((a, b) =>
                sortAscending ? a.price - b.price : b.price - a.price
            )
        );

        setSortAscending((current) => !current);
    };

    const searchDrink = products.filter((drink) =>
        drink.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={cn(styles['drinks-list'])}>
            <Button onClick={sortByPrice}>
                {sortAscending ? 'По возрастанию' : 'По убыванию'}
            </Button>

            {loading && (
                <div className={styles['loading-container']} role="status">
                    <div className={styles['loading-spinner']} aria-hidden="true">
                        <span />
                        <span />
                        <span />
                    </div>
                    <p>Загружаем напитки...</p>
                </div>
            )}

            {!loading && error && (
                <div className={styles['loading-message']} role="alert">
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={() => setReloadKey((key) => key + 1)}
                    >
                        Повторить
                    </button>
                </div>
            )}

            {!loading && !error && searchDrink.length === 0 && (
                <p className={styles['loading-message']}>
                    Товары не найдены.
                </p>
            )}

            {!loading &&
                !error &&
                searchDrink.map((drink) => (
                    <ProductCard
                        key={drink.id}
                        id={drink.id}
                        poster={drink.poster}
                        title={drink.title}
                        rating={drink.rating}
                        price={drink.price}
                        type="drinks"
                    />
                ))}
        </div>
    );
}
