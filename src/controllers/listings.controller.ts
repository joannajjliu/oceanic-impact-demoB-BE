import { Request, Response } from "express";
import ListingService, { IFilter } from "@/services/listings.service";
import ImageService from "@/services/image.service";
import { isValidObjectId, Types } from "mongoose";
import _ from "lodash";

export default class ListingsController {
    public listingService = new ListingService();
    public imageService = new ImageService();

    public getListings = async (req: Request, res: Response) => {
        try {
            const validFields = ["search", "type", "datelt", "dategt", "bountylt", "bountygt", "tags", "longitude", "latitude", "radius", "author", "sortBy"];
            
            const filter = req.query as any;
            try {
                if (!!filter.datelt) {
                    filter.datelt = new Date(parseInt(filter.datelt));
                }

                if (!!filter.dategt) {
                    filter.dategt = new Date(parseInt(filter.dategt));
                }
            } catch (e) {
                return res.status(400).send({message: "Invalid date format"});
            }

            try {
                if (!!filter.longitude) {
                    filter.longitude = parseFloat(filter.longitude);
                }

                if (!!filter.latitude) {
                    filter.latitude = parseFloat(filter.latitude);
                }
            } catch (e) {
                return res.status(400).send({message: "Invalid format for longitude or latitude"});
            }

            try {
                if (!!filter.radius) {
                    filter.radius = parseFloat(filter.radius);
                }
            } catch (e) {
                return res.status(400).send({message: "Invalid format for radius"});
            }

            try {
                if (!!filter.sortBy) {
                    const validOrders = ["bounty", "-bounty"];
                    if (!validOrders.includes(filter.sortBy as string)) {
                        return res.status(400).send({message: "Invalid order. Sort by \"bounty\" or \"-bounty\""});
                    }
                }
            } catch (e) {
                return res.status(400).send({message: "Invalid order. Sort by \"bounty\" or \"-bounty\""});
            }

            const validFilter = _.pick(filter, validFields) as IFilter;

            
            const listings = await this.listingService.getListings(validFilter);
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
                return res.status(404).json({ error: 'Listing not found' });
            }
            res.status(200).json({ listing });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "server error"
            });
        }
    }

    public addListing = async (req: Request, res: Response) => {
        let newListing = req.body;
        const author = req.user; // get user
        if (!author) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            // only allow certain fields to be added to the listing
            newListing = _.pick(newListing, ["title", "description", "type", "location", "bounty", "tags", "imageIDs"]);
            const missingFields = _.difference(["title", "description", "type", "location", "bounty"], Object.keys(newListing));
            if (missingFields.length > 0) {
                // missing some required fields
                return res.status(400).json({ error: 'Missing required fields', missingFields });
            }
            if (!newListing.location.coords || !newListing.location.coords.length) {
                return res.status(400).json({ error: 'Missing required fields', missingFields: ["location.coords"] });
            }
            
            const listing = await this.listingService.addListing(new Types.ObjectId(author._id), newListing);
            res.status(201).json({ listing });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "server error"
            });
        }
    }    

    public deleteListing = async (req: Request, res: Response) => {
        const { id: listingId } = req.params;
        const author = req.user!; // get user
        try {
            if (!isValidObjectId(listingId)) {
                return res.status(400).json({ error: 'Invalid listing ID' });
            }
            const listingId_ = new Types.ObjectId(listingId);

            const ownsListing = await this.listingService.ownsListing(new Types.ObjectId(author._id), listingId_);

            if (ownsListing == null) {
                return res.status(404).json({ error: 'Listing not found' });
            } else if (!ownsListing) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const deletedListing = await this.listingService.deleteListing(listingId_);
            if (!deletedListing) {
                console.error(`Listing ${listingId} not found during deletion`);
                return res.status(500).json({ error: 'Server error' });
            }

            return res.status(200).json({ deletedListing });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "server error"
            });
        }
    }

    public editListing = async (req: Request, res: Response) => {
        const { id: listingId } = req.params;
        if (!Types.ObjectId.isValid(req.user!._id)) {
            return res.status(500).json({ error: 'Invalid user ID' });
        }
        const currentUserID = new Types.ObjectId(req.user!._id);

        try {
            if (!isValidObjectId(listingId)) {
                return res.status(400).json({ error: 'Invalid listing ID' });
            }
            const listingId_ = new Types.ObjectId(listingId);

            const ownsListing = await this.listingService.ownsListing(currentUserID, listingId_);

            if (ownsListing == null) {
                console.log("listing not found");
                return res.status(404).json({ error: 'Listing not found' });
            } else if (!ownsListing) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const update = _.pick(req.body, [
                "title",
                "description",
                "location",
                "bounty",
                "tags",
                "imageIDs",
                "resolved"
            ]);

            if (Object.keys(update).length === 0) {
                return res.status(400).json({
                    error: "No fields were modifiable",
                });
            }

            if (update.imageIDs) {
                // imageIDs are being updated
                if (!Array.isArray(update.imageIDs)) {
                    // verify that imageIDs is an array
                    return res.status(400).json({
                        error: "imageIDs must be an array",
                    });
                }

                if (update.imageIDs.length > 0) {
                    // if imageIDs is not empty, check that the user owns all the images
                    const owned = await Promise.all(update.imageIDs.map(async (imageID: string) => {
                        return await this.imageService.checkOwnerById(imageID, currentUserID);
                    }));

                    const allowedImageIDs = update.imageIDs.filter((imageID: string, index: number) => {
                        return owned[index];
                    });
                    
                    if (allowedImageIDs.length !== update.imageIDs.length) {
                        return res.status(403).json({
                            error: "Forbidden",
                            message: "Some of the specified imageIDs are not owned by the user",
                        });
                    } else {
                        update.imageIDs = allowedImageIDs;
                    }
                }
            }

            const result = await this.listingService.editListing(
                listingId_,
                update
            );

            if (!result) {
                return res.status(500).json({
                    error: "server error",
                });
            } else {
                return res.status(200).json({
                    message: "Successfully updated",
                    listing: result,
                });
            }
        } catch (error: any) {
            console.error(error);
            res.status(500).json({
                message: "Server error",
            });
        }
    };
}
