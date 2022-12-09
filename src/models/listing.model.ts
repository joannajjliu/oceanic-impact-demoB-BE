import mongoose from 'mongoose';

import { Types, Schema } from 'mongoose';

interface ILocation {
    coords: () => [number, number];
    name?: string;
}

const getCoords = (coords: [mongoose.Types.Decimal128, mongoose.Types.Decimal128]) => {
    return [parseFloat(coords[0].toString()), parseFloat(coords[1].toString())];
};
        

const locationSchema = new Schema<ILocation>({
    coords: {
        type: [mongoose.Types.Decimal128, mongoose.Types.Decimal128],
        required: true,
        index: '2dsphere', // 2dsphere index for geospatial queries
        get: getCoords
    }, 
    name: {
        type: String,
        index: "text",
    }
}, {toJSON: {getters: true}});


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
        required: true,
        index: "text"
    }, 
    description: {
        type: String,
        required: true,
        index: "text",
    }, 
    location: {
        type: locationSchema,
        required: true
    },
    poster: {
        type: Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    type: {
        type: String,
        enum: ["LOST", "FOUND"],
        required: true
    }, 
    bounty: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String]
    }, 
    imageIDs: [{
        ref: 'Image', 
        type: Schema.Types.ObjectId
    }], 
    resolved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Listing = mongoose.model<IListing>('Listing', listingSchema);

export default Listing;
