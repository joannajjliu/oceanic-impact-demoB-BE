import Listing, {IListing} from "@models/listing.model";
import { HydratedDocument } from "mongoose";

type Filter = {
    title?: string;
    description?: string;
}

export default class ListingService {
    public listing_model = Listing;

    public async getListings(
        filter: Filter
    ): Promise<Array<HydratedDocument<IListing>>> {
        // get listings based on filter, return all if filter is empty
        var condition = {
            "title": {$regex: "", $options: "i"}, 
            "description": {$regex: "", $options: "i"}
        };

        if ("title" in filter) {
            condition["title"].$regex = filter.title!;
        };
        if ("description" in filter) {
            condition["description"].$regex = filter.description!;
        }
        console.log(condition);

        const listings = await this.listing_model.find(condition);
        return listings;
    }

    public async getListingById(
        id: string
    ): Promise<HydratedDocument<IListing> | null> {
        // get listing by id
        const listing = await this.listing_model.findById(id);
        return listing as HydratedDocument<IListing> | null;
    }
}
