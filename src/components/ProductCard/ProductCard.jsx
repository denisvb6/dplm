import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import cn from 'classnames';
import { getPosterUrl } from '../../utils/getPosterUrl';

export const ProductCard = ({ id, poster, title, rating, price, type }) => (
    <div className={cn(styles['product-card'])}>
        <div className={cn(styles['product-card__poster-wrapper'])}>
            <img
                className={cn(styles['product-card__poster'])}
                src={getPosterUrl(poster)}
                alt={title}
            />
            <div className={cn(styles['product-card__rating-badge'])}>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M7.99992 1.33325L10.0599 5.77325L15.0199 6.44992L11.5099 9.79992L12.4199 14.7333L7.99992 12.2999L3.57992 14.7333L4.48992 9.79992L0.979919 6.44992L5.93992 5.77325L7.99992 1.33325Z"
                        fill="#F5C518"
                    />
                </svg>
                <span>{rating}</span>
            </div>
        </div>
        <div className={cn(styles['product-card__info'])}>
            <h2>{title}</h2>
            <h4>{id}</h4>
            <h4>Цена: {price} р.</h4>
        </div>
        <Link to={`/card/${type}/${id}`} className={cn(styles['product-card__button'])}>
            Открыть карточку
        </Link>
    </div>
);
