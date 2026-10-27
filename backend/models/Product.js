import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    id: {
        type: Number,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true,
        enum: ['vegetables', 'drinks']
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    rating: {
        type: Number,
        min: 0,
        max: 10
    },

    poster: {
        type: String,
        required: true
    }
});

productSchema.index(
    { id: 1, type: 1 },
    { unique: true }
);

const Product = model('Product', productSchema);

export default Product;
