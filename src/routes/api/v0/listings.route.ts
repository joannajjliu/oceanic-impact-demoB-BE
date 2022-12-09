import { Router } from 'express'
import ListingsController from '@/controllers/listings.controller';
import Route from '@interfaces/route.interface';
import { verifyAuth } from '@/middlewares/auth.middleware';


export default class ListingsRoute implements Route {
    public router: Router = Router();
    private listingController = new ListingsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/', this.listingController.getListings);
        this.router.get('/:id', this.listingController.getListingById);
        this.router.post('/', verifyAuth, this.listingController.addListing);
        this.router.delete('/:id', verifyAuth, this.listingController.deleteListing);
        this.router.patch('/:id', verifyAuth, this.listingController.editListing);
    }

}
