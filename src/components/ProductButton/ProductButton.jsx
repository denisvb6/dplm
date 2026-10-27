import styles from './ProductButton.module.css';
import cn from 'classnames';
import { forwardRef } from 'react';

export const ProductButton = forwardRef((props, ref) => (
    <button ref={ref} {...props} className={cn(styles['productButton'])}>
        {props.children}
    </button>
));
