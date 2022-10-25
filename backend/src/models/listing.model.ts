const mongoose = require('mongoose');

import { Types, Schema } from 'mongoose';


interface ILocation {
    lattitude: Types.Decimal128;
    longitude: Types.Decimal128;
    name: string;
}

const locationSchema = new Schema<ILocation>({
    lattitude: {
        type: mongoose.Decimal128,
        required: true
    }, 
    longitude: {
        type: mongoose.Decimal128,
        required: true
    }, 
    name: {
        type: String
    }
});


interface IListing {
    ID: Types.ObjectId;
    title: string;
    description: string;
    location: Location;
    posterID: Types.ObjectId;
    type: string;
    date?: Date;
    bounty?: Number;
    tags?: [string];
    imageURL?: string;
    resolved: Boolean;
}

const listingSchema = new Schema<IListing>({
    ID: {
        type: Schema.Types.ObjectId, 
        required: true
    },
    title: {
        type: String, 
        required: true
    }, 
    description: {
        type: String,
        required: true
    }, 
    location: {
        type: locationSchema,
        required: true
    }, 
    posterID: {
        type: Schema.Types.ObjectId, 
        required:true
    },
    type: {
        type: String,
        enum: ["LOST", "FOUND"],
        required: true
    }, 
    date: {
        type: Date, 
        default: Date.now
    },
    bounty: {
        type: Number, 
        default: 0
    }, 
    tags: {
        type: [String]
    }, 
    imageURL: {
        type: String
    }, 
    resolved: {
        type: Boolean, 
        default: false
    }
}, {collection:'Listings'});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
