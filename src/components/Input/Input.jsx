import styles from './Input.module.css';
import searchIcon from '/src/assets/searchIcon.png';
import cn from 'classnames';
import { forwardRef } from 'react';

export const Input = forwardRef((props, ref) => {
    const { placeholder,  ...restProps } = props;


    return (
        <div className={cn(styles['inputWrapper'])}>
            <img
                src={searchIcon}
                alt="Поиск"
                className={cn(styles['searchIcon'])}
            />
            <input
                ref={ref}
                {...restProps}
                className={cn(styles['inputSearch'])}
                type="text"
                placeholder={placeholder}
            />
        </div>
    );
});