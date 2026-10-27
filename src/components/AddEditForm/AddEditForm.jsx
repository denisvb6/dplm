import cn from 'classnames';
import { useEffect, useState } from 'react';
import styles from './AddEditForm.module.css';
import { useAdmin } from '../../AdminContext/AdminContext';

const AddEditForm = ({
    editingItem,
    setEditingItem,
    editingOrderItem,
    onSaveOrderItem
}) => {
    const [id, setId] = useState('');
    const [title, setTitle] = useState('');
    const [type, setType] = useState('vegetables');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [poster, setPoster] = useState('');

    const { updateAdminItem } = useAdmin();

    useEffect(() => {
        if (editingOrderItem) {
            const item = editingOrderItem.item;

            setId(item.productId);
            setTitle(item.title);
            setType(item.productType);
            setPrice(item.price);
            setQuantity(item.quantity);
            setPoster(item.poster || '');

            return;
        }

        if (editingItem) {
            setId(editingItem.id);
            setTitle(editingItem.title);
            setType(editingItem.type);
            setPrice(editingItem.price);
            setQuantity('');
            setPoster(editingItem.poster || '');

            return;
        }

        setId('');
        setTitle('');
        setType('vegetables');
        setPrice('');
        setQuantity('');
        setPoster('');
    }, [editingItem, editingOrderItem]);

    const handleSave = async (event) => {
        event.preventDefault();

        if (!editingItem && !editingOrderItem) {
            alert('Выберите товар для редактирования');
            return;
        }

        if (
            id === '' ||
            !title.trim() ||
            !type ||
            price === '' ||
            poster === ''
        ) {
            alert('Заполните все поля');
            return;
        }

        const numericId = Number(id);
        const numericPrice = Number(price);

        if (
            !Number.isInteger(numericId) ||
            numericId < 1 ||
            !Number.isFinite(numericPrice) ||
            numericPrice < 0
        ) {
            alert('Проверьте ID и стоимость товара');
            return;
        }

        // Редактирование позиции заказа.
        if (editingOrderItem) {
            const numericQuantity = Number(quantity);

            if (
                quantity === '' ||
                !Number.isInteger(numericQuantity) ||
                numericQuantity < 1
            ) {
                alert('Количество должно быть целым числом не меньше 1');
                return;
            }

            const updatedItem = {
                productId: numericId,
                productType: type,
                title: title.trim(),
                price: numericPrice,
                quantity: numericQuantity,
                poster
            };

            try {
                await onSaveOrderItem(updatedItem);
            } catch (error) {
                console.error(
                    'Ошибка сохранения позиции заказа:',
                    error
                );
                alert(error.message || 'Не удалось изменить позицию заказа');
            }

            return;
        }

        // Редактирование существующего товара каталога.
        // Добавления новых товаров здесь нет.
        const product = {
            id: numericId,
            title: title.trim(),
            type,
            price: numericPrice,
            poster
        };

        try {
            await updateAdminItem(product);
            setEditingItem(null);
            alert('Товар успешно изменён');
        } catch (error) {
            console.error('Ошибка изменения товара:', error);
            alert(error.message || 'Ошибка изменения товара');
        }
    };

    return (
        <div className={cn(styles['add-edit-form'])}>
            <h4>
                {editingOrderItem
                    ? 'Редактирование товара в заказе'
                    : 'Редактирование товара каталога'}
            </h4>

            <form onSubmit={handleSave}>
                <input
                    type="number"
                    min="1"
                    step="1"
                    value={id}
                    onChange={(event) => setId(event.target.value)}
                    placeholder="ID"
                    disabled={Boolean(editingOrderItem)}
                    required
                />

                <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Наименование"
                    required
                />

                <select
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    disabled={Boolean(editingOrderItem)}
                    required
                >
                    <option value="vegetables">Овощи</option>
                    <option value="drinks">Напитки</option>
                </select>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="Стоимость за единицу"
                    required
                />

                {editingOrderItem && (
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(event) =>
                            setQuantity(event.target.value)
                        }
                        placeholder="Количество"
                        required
                    />
                )}

                <input
                    type="text"
                    value={poster}
                    onChange={(event) => setPoster(event.target.value)}
                    placeholder="Фото"
                    required
                />

                <button
                    type="submit"
                    disabled={!editingItem && !editingOrderItem}
                >
                    {editingOrderItem
                        ? 'Сохранить изменения заказа'
                        : 'Изменить товар'}
                </button>
            </form>
        </div>
    );
};

export default AddEditForm;