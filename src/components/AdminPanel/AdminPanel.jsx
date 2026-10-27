import { useState, useEffect } from 'react';

import { useAdmin } from '../../AdminContext/AdminContext';
import AddEditForm from '../AddEditForm/AddEditForm';

import deleteRowIcon from '../../assets/deleteRowIcon.png';
import penIcon from '../../assets/penIcon.png';
import { getPosterUrl } from '../../utils/getPosterUrl';

import styles from './AdminPanel.module.css';

const AdminPanel = () => {
    const { orders, loadOrders, updateOrder, removeOrderItem } = useAdmin();

    const [editingItem, setEditingItem] = useState(null);
    const [editingOrderItem, setEditingOrderItem] = useState(null);

    useEffect(() => { loadOrders(); }, []);

    // Открыть позицию заказа в левой панели.
    const handleEditOrderItem = (order, item, itemIndex) => {
        setEditingItem(null);

        setEditingOrderItem({
            orderId: order._id,
            itemIndex,
            item: { ...item }
        });
    };

    // Сохранить позицию заказа из левой панели.
    const handleSaveOrderItem = async (updatedItem) => {
        if (!editingOrderItem) {
            throw new Error('Не выбрана позиция заказа');
        }

        const { orderId, itemIndex } = editingOrderItem;
        const order = orders.find((current) => current._id === orderId);

        if (!order || !order.items[itemIndex]) {
            alert('Заказ или товар не найден. Обновите страницу.');
            throw new Error('Заказ или товар не найден');
        }

        const updatedItems = order.items.map((item, index) =>
            index === itemIndex
                ? { ...item, ...updatedItem }
                : item
        );

        try {
            await updateOrder(orderId, {
                items: updatedItems
            });

            setEditingOrderItem(null);

            // alert('Позиция заказа успешно изменена');
        } catch (error) {
            console.error('Ошибка изменения позиции заказа:', error);

            alert(error.message || 'Не удалось изменить позицию заказа');

            throw error;
        }
    };

    // Удалить одну позицию заказа.
    const handleDeleteOrderItem = async (orderId, itemIndex) => {
        const confirmed = window.confirm(
            'Удалить только этот товар из заказа?'
        );

        if (!confirmed) return;

        try {
            await removeOrderItem(orderId, itemIndex);

            if (
                editingOrderItem?.orderId === orderId &&
                editingOrderItem?.itemIndex === itemIndex
            ) {
                setEditingOrderItem(null);
            }
        } catch (error) {
            console.error('Ошибка удаления позиции заказа:', error);

            alert(error.message || 'Не удалось удалить товар из заказа');
        }
    };

    const getCategoryName = (type) =>
        type === 'drinks' ? 'Напитки' : 'Овощи';

    return (
        <div className={styles['admin-panel']}>
            {/* Левая панель: форма редактирования */}
            <aside className={styles['admin-sidebar']}>
                <div className={styles['admin-form-wrapper']}>
                    <AddEditForm
                        editingItem={editingItem}
                        setEditingItem={setEditingItem}
                        editingOrderItem={editingOrderItem}
                        onSaveOrderItem={handleSaveOrderItem}
                    />
                </div>
            </aside>

            {/* Правая панель: таблица заказов */}
            <div className={styles['admin-table-wrapper']}>
                <table className={styles['admin-table']}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Наименование</th>
                            <th>Категория</th>
                            <th>Стоимость</th>
                            <th>Кол-во</th>
                            <th>Фото</th>
                            <th>Действие</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className={styles['empty-orders']}
                                >
                                    Заказов пока нет
                                </td>
                            </tr>
                        ) : (
                            orders.flatMap((order) =>
                                order.items.map((item, index) => (
                                    <tr
                                        key={`${order._id}-${item.productType}-${item.productId}-${index}`}
                                    >
                                        <td>{item.productId}</td>

                                        <td>{item.title}</td>

                                        <td>
                                            {getCategoryName(item.productType)}
                                        </td>

                                        <td>
                                            {(
                                                item.price * item.quantity
                                            ).toLocaleString('ru-RU')}{' '}
                                            р.
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    styles['quantity-value']
                                                }
                                            >
                                                {item.quantity}{' '}
                                                {item.productType === 'drinks'
                                                    ? 'бут.'
                                                    : 'кг.'}
                                            </span>
                                        </td>

                                        <td>
                                            <img
                                                src={getPosterUrl(item.poster)}
                                                alt={item.title}
                                            />
                                        </td>

                                        <td>
                                            <div
                                                className={
                                                    styles['order-actions']
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    className={
                                                        styles[
                                                            'order-actions__edit'
                                                        ]
                                                    }
                                                    onClick={() =>
                                                        handleEditOrderItem(
                                                            order,
                                                            item,
                                                            index
                                                        )
                                                    }
                                                    title="Редактировать товар в заказе"
                                                    aria-label={`Редактировать ${item.title} в заказе`}
                                                >
                                                    <img
                                                        src={penIcon}
                                                        alt=""
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        styles[
                                                            'order-actions__delete'
                                                        ]
                                                    }
                                                    onClick={() =>
                                                        handleDeleteOrderItem(
                                                            order._id,
                                                            index
                                                        )
                                                    }
                                                    title="Удалить товар из заказа"
                                                    aria-label={`Удалить ${item.title} из заказа`}
                                                >
                                                    <img
                                                        src={deleteRowIcon}
                                                        alt=""
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export { AdminPanel };