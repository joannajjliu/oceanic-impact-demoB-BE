import mongoose from 'mongoose';

import { Types, Schema, CallbackError } from 'mongoose';


interface ILocation {
    latitude: Types.Decimal128;
    longitude: Types.Decimal128;
    name?: string;
}

const locationSchema = new Schema<ILocation>({
    latitude: {
        type: mongoose.Types.Decimal128,
        required: true
    }, 
    longitude: {
        type: mongoose.Types.Decimal128,
        required: true
    }, 
    name: {
        type: String
    }
});


export interface IListing {
    title: string;
    description: string;
    location: ILocation;
    poster: Types.ObjectId;
    type: string;
    date?: Date;
    bounty?: Number;
    tags?: [string];
    imageIDs?: [string];
    resolved: Boolean;
};

const listingSchema = new Schema<IListing>({
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
    poster: {
        type: Schema.Types.ObjectId, 
        ref: 'Profile',
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
    imageIDs: {
        ref: 'Image', 
        type: Schema.Types.ObjectId
    }, 
    resolved: {
        type: Boolean, 
        default: false
    }
}, {collection:'Listings'});

listingSchema.statics.findWithFilter = async (filter) => {
    let listings = Listing.find(filter);
    return listings;
}

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
