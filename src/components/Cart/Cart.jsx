import { Input } from '../Input/Input';
import styles from './Cart.module.css';
import cn from 'classnames';
import { useCart } from '../../CartContext/CartContext';
import { Header } from '../Layout/Header';
import { useNavigate } from 'react-router-dom';
import deleteIcon from '../../assets/deleteIcon.png';
import { useUser } from '../../UserContext/UserContext';
import { getPosterUrl } from '../../utils/getPosterUrl';

export const Cart = () => {
    const { cartItems, removeFromCart, createOrder } = useCart();
    const { currentUser } = useUser();
    const navigate = useNavigate();

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const handleOrder = async () => {
        if (cartItems.length === 0) {
            alert('Корзина пуста');
            return;
        }

        // Оформлять заказ может только авторизованный пользователь.
        if (!currentUser) {
            navigate('/login');
            return;
        }

        try {
            await createOrder();
            alert('Заказ успешно оформлен!');
            // Обычный пользователь не должен попадать в админку.
            navigate(currentUser.role === 'admin' ? '/admin' : '/');
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            alert(error.message || 'Не удалось оформить заказ');
        }
    };

    return (
        <div className={cn(styles['cart'])}>
            <Header />

            <div className={cn(styles['cart-container'])}>
                <div className={cn(styles['cart-search'])}>
                    <Input placeholder="Поиск товара..." />
                </div>

                <div className={cn(styles['cart-content'])}>
                    <div className={cn(styles['cart-products'])}>
                        {cartItems.map((item) => (
                            <div
                                className={cn(styles['cart-item'])}
                                key={item.cartId}
                            >
                                <img
                                    src={getPosterUrl(item.poster)}
                                    alt={item.title}
                                    className={cn(styles['cart-item__poster'])}
                                />

                                <div className={cn(styles['cart-item__info'])}>
                                    <div
                                        className={cn(styles['cart-item__id'])}
                                    >
                                        ID: {item.id}
                                    </div>

                                    <div
                                        className={cn(
                                            styles['cart-item__details']
                                        )}
                                    >
                                        <div>
                                            <span>Наименование</span>
                                            <strong>{item.title}</strong>
                                        </div>
                                        <div>
                                            <span>Количество</span>
                                            <strong>{item.quantity}</strong>
                                        </div>
                                        <div>
                                            <span>Стоимость</span>
                                            <strong>
                                                {item.price * item.quantity} р.
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={cn(styles['cart-item__remove'])}
                                    onClick={() => removeFromCart(item.cartId)}
                                >
                                    <img src={deleteIcon} alt="Удалить товар" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className={cn(styles['cart-total'])}>
                        <div className={cn(styles['cart-total__price'])}>
                            Итого: {totalPrice} р.
                        </div>

                        <button
                            type="button"
                            className={cn(styles['cart-total__button'])}
                            onClick={handleOrder}
                        >
                            Оформить заказ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
