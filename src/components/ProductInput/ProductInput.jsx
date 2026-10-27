import { forwardRef } from 'react';
import styles from './ProductInput.module.css';
import cn from 'classnames';

export const ProductInput = forwardRef((props, ref) => (
    <input type="text" ref={ref} {...props} className={cn(styles['productInput'])} />
));