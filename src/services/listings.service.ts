import Profile, { IProfile } from "@/models/profile.model";
import { IUser } from "@/models/users.model";
import Listing, { IListing } from "@models/listing.model";
import mongoose, { HydratedDocument, ObjectId, Types } from "mongoose";

export interface IFilter {
    search?: string;
    tags?: [string];
    type?: string;
    datelt?: Date;
    dategt?: Date;
    bountylt?: number;
    bountygt?: number;
    longitude?: number;
    latitude?: number;
    radius?: number;
    author?: string;
    sortBy?: string;
}

interface ICondition {
    $or?: [
        {description: {$regex: string, $options: mongoose.RegexOptions}},
        {title: {$regex: string, $options: mongoose.RegexOptions}}
    ];
    tags?: { $in: [string] };
    type?: string;
    createdAt?: { $lt?: Date, $gt?: Date }; // createdAt is created by mongoose automatically
    bounty?: { $lt?: number, $gt?: number };
    "location.coords"?: { $near?: { $geometry: { type: string, coordinates: [number, number] }, $maxDistance: number } };
    poster?: Types.ObjectId | string;
}

export default class ListingService {
    public listing_model = Listing;
    public profile_model = Profile;

    public async getListings(
        filter: IFilter
    ): Promise<Array<HydratedDocument<IListing>>> {
        // get listings based on filter, return all if filter is empty
        let condition: ICondition = {};
        if (Object.keys(filter).length > 0) { // no filter otherwise

            if (!!filter.search){
                condition.$or = [
                    {description: {$regex: filter.search, $options: "i"}},
                    {title: {$regex: filter.search, $options: "i"}}
                ];
            }

            if (!!filter.tags && filter.tags.length > 0) {
                condition["tags"] = {$in: filter.tags};
            }
            if (!!filter.type) {
                condition["type"] = filter.type;
            }
            // date
            if (!!filter.datelt || !!filter.dategt) {
                condition["createdAt"] = {
                }; 

                if (!!filter.datelt) {
                    condition["createdAt"].$lt = filter.datelt;
                }
                if (!!filter.dategt) {
                    condition["createdAt"].$gt = filter.dategt;
                }
            }

                // bounty
            if (!!filter.bountylt || !!filter.bountygt) {
                condition["bounty"] = {
                };
                
                if (!!filter.bountylt) {
                    condition["bounty"].$lt = filter.bountylt;
                }
                if (!!filter.bountygt) {
                    condition["bounty"].$gt = filter.bountygt;
                }
            }
            // location
            if (filter.longitude !== undefined && filter.latitude !== undefined) {
                condition["location.coords"] = {
                };
                condition["location.coords"].$near = {
                    $geometry: {
                        type: "Point",
                        coordinates: [filter.longitude, filter.latitude]
                    },
                    $maxDistance: filter?.radius === undefined ? 1000 : filter!.radius // default radius is 1km
                }
            }

            if (!!filter.author) {
                condition["poster"] = filter.author;
            }
        }

        let listings;

        let query = this.listing_model.find(condition);

        // sort results if sortBy exists
        if (!!filter.sortBy) {
            query = query.sort(filter.sortBy === "bounty" ? { bounty: 1 } : { bounty : -1 });
        }

        listings = await query.populate("poster");
        return listings;
    }

    public async getListingById(
        id: string
    ): Promise<HydratedDocument<IListing> | null> {
        // get listing by id
        const listing = await this.listing_model.findById(id);
        return listing as HydratedDocument<IListing> | null;
    }

    public async addListing(author_id: Types.ObjectId, listing: IListing): Promise<HydratedDocument<IListing>> {
        const author_profile = await this.profile_model.findOne({ user: author_id });
        if (!author_profile) {
            throw new Error("Author profile not found");
        }
        listing.poster = author_profile._id;
        const newListing = this.listing_model.create(listing);
        return newListing;
    }

    public async ownsListing(author_id: Types.ObjectId, listingId: Types.ObjectId): Promise<boolean | null> {
        const listing = await this.listing_model.findOne({
            _id: listingId,
        })

        if (!listing) {
            return null;
        }

        // populate the poster field with Profile
        await Profile.populate(listing, { path: "poster" });
        // verify that the author_id matches the user id of the poster
        return (((listing.poster as unknown as HydratedDocument<IProfile>).user) as unknown as HydratedDocument<IUser>)._id.equals(author_id);
    }

    public async deleteListing(listingId: Types.ObjectId): Promise<IListing | null> {
        const deletedListing = await this.listing_model.findOneAndDelete({ _id: listingId });
        return deletedListing;
    }

    public async editListing(
        id: Types.ObjectId,
        updateObj: any,
    ): Promise<HydratedDocument<IListing> | null> {
        const listing = await this.listing_model.findById(id);

        if (!listing) {
            return null;
        }

        try {
            const updatedListing = await this.listing_model.findOneAndUpdate(
                { _id: id },
                updateObj,
                { new: true }
            );
            return updatedListing;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}
