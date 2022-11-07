import dotenv from 'dotenv'
import {resolve} from 'path'
import App from './app';
import { connectDatabase } from './db';

dotenv.config({ // If $NODE_ENV is production, then .env.production will be loaded, otherwise will load .env.development
    path: resolve(__dirname, `../.env${process.env.NODE_ENV === 'production' ? '.production' : '.development'}`)
});

const port = process.env.PORT || 3000; // If $PORT is not set, then 3000 will be used

connectDatabase(process.env.MONGO_URI as string, process.env.MONGO_DB_NAME as string).then(() => {
    const app_ = new App();

    app_.app.listen(port, () => {
        console.log(`Express server started on port ${port}`);
    });
});