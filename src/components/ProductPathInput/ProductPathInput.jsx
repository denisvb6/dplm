import styles from './ProductPathInput.module.css';
import cn from 'classnames';
import { forwardRef } from 'react';

export const ProductPathInput = forwardRef((props, ref) => {
    // const [username, setUsername] = useState('');
    const { ...restProps } = props;


    return (
        <div className={cn(styles['inputProductPath'])}>
            <span className={cn(styles['path'])}>Путь к товару:</span>
            <input
                ref={ref}
                // value={username}
                {...restProps}
                className={cn(styles['inputPath'])}
                type="text"
                // onChange={(e) => setUsername(e.target.value)}
                readOnly
            />
        </div>
    );
});