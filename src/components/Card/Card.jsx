import styles from './Card.module.css';
import cn from 'classnames';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductPathInput } from '../ProductPathInput/ProductPathInput';
import { useCart } from '../../CartContext/CartContext';
import { Header } from '../Layout/Header';
import { getPosterUrl } from '../../utils/getPosterUrl';

export const Card = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/products/${type}/${id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Товар не найден');
                }

                return response.json();
            })
            .then((data) => {
                setCard(data);
            })
            .catch((error) => {
                console.error('Ошибка загрузки товара:', error);
                setCard(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [type, id]);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (!card) {
        return <div>Продукт не найден</div>;
    }

    const unit = type === 'drinks' ? 'бут.' : 'кг.';

    const handleBuy = () => {
        addToCart({
            ...card,
            type
        });

        navigate(`/cart/${id}`);
    };

    return (
        <div className={cn(styles['card'])}>
            <Header />

            <div className={cn(styles['card-container'])}>
                <ProductPathInput value={`/card/${type}/${id}`} />

                <div className={cn(styles['product-content'])}>
                    <img
                        className={cn(styles['product-card__poster'])}
                        src={getPosterUrl(card.poster)}
                        alt={card.title}
                    />

                    <div className={cn(styles['product-card__info'])}>
                        <h2>{card.title}</h2>

                        <h3>1 {unit}</h3>

                        <h3>Стоимость: {card.price} р.</h3>

                        <button
                            className={cn(styles['buy-button'])}
                            onClick={handleBuy}
                        >
                            Купить
                        </button>

                        <div className={cn(styles['card__id'])}>
                            <h3>ID: {card.id}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
