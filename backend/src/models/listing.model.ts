const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
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

const listingSchema = new mongoose.Schema({
    ID: {
        type: mongoose.ObjectID, 
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
        type: mongoose.ObjectID, 
        required:true
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
    imageID: {
        type: mongoose.ObjectID
    }

}, {collection:'Listings'});

const Item = mongoose.model('Listing', listingSchema);

module.exports = Item;
