
import { required } from 'joi';
import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({

    comanyName: {
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
    comapnyLogo: {
        type: String,
        required: false,
    }
    ,
    comapnyFavicon: {
        type: String,
        required: false,
    }


}, { timestamps: true });


export const Config = mongoose.models.Config || mongoose.model('Config', configSchema);
