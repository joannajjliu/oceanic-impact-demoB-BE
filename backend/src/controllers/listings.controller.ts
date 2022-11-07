import { Request, Response } from "express";
import ListingService from "@/services/listings.service";

export default class ListingsController {
    public listingService = new ListingService();

    public getListings = async (req: Request, res: Response) => {
        try {
            // return all or filtered listings
            // TODO: add filter by location name & coord radius
            const validFields = ["title", "description", "poster", "type", "date", "bounty"]
            
            const filter = req.query;

            for (const field in filter) {
                if (!validFields.includes(field)) {
                    delete filter[field];
                }
            }

            const listings = await this.listingService.getListings(filter);
            res.status(200).json({listings});
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "server error"
            });
        }
    }

    public getListingById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const listing = await this.listingService.getListingById(id);
            if (!listing) {
                return res.status(404).json({error: 'Listing not found'});
            }
            res.status(200).json({listing});
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "server error"
            });
        }
    }
}

