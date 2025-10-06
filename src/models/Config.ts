
import { required } from 'joi';
import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({

    companyName: {
        type: String,
        required: true,

    },
    companyEmail: {
        type: String,
        required: false,

    },
    companyWhatsapp: {
        type: String,
        required: false,

    },
    companyLogo: {
        type: String,
        required: false,
    }
    ,
    companyFavicon: {
        type: String,
        required: false,
    }


}, { timestamps: true });


export const Config = mongoose.models.Config || mongoose.model('Config', configSchema);
