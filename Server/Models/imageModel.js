import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    public_id: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

export const imageModel = mongoose.model('Image', imageSchema);
