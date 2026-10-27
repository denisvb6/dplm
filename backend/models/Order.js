import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema(
    {
        productId: { type: Number, required: true },
        productType: { type: String, required: true, enum: ['vegetables', 'drinks'] },
        title: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        poster: { type: String, required: true }
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        items: { type: [orderItemSchema], required: true },
        total: { type: Number, required: true, min: 0 },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }  // ← только здесь
    },
    { timestamps: true }
);

const Order = model('Order', orderSchema);
export default Order;