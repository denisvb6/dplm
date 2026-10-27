import { ProductCard } from '../ProductCard/ProductCard';
import styles from './VegetablesList.module.css';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Button } from '../Button/Button';

export function VegetablesList({ search = '' }) {
    const [products, setProducts] = useState([]);
    const [sortAscending, setSortAscending] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        const loadVegetables = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(
                    '/api/products',
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error('Не удалось загрузить овощи');
                }

                const data = await response.json();

                const vegetables = data.filter(
                    (product) => product.type === 'vegetables'
                );

                setProducts(vegetables);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Ошибка загрузки овощей:', err);
                    setError('Не удалось загрузить овощи. Проверьте соединение с сервером.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadVegetables();

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

    const searchVegetable = products.filter((vegetable) =>
        vegetable.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={cn(styles['vegetables-list'])}>
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
                    <p>Загружаем овощи...</p>
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

            {!loading && !error && searchVegetable.length === 0 && (
                <p className={styles['loading-message']}>
                    Товары не найдены.
                </p>
            )}

            {!loading &&
                !error &&
                searchVegetable.map((vegetable) => (
                    <ProductCard
                        key={vegetable.id}
                        id={vegetable.id}
                        poster={vegetable.poster}
                        title={vegetable.title}
                        rating={vegetable.rating}
                        price={vegetable.price}
                        type="vegetables"
                    />
                ))}
        </div>
    );
}
