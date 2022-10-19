import dotenv from 'dotenv'
import {resolve} from 'path'

dotenv.config({ // If $NODE_ENV is production, then .env.production will be loaded, otherwise will load .env.development
    path: resolve(__dirname, '../.env', process.env.NODE_ENV === 'production' ? '.production' : '.development')
});

import app from './app';

const port = process.env.PORT || 3000; // If $PORT is not set, then 3000 will be used
app.listen(port, () => {
    console.log(`Express server started on port ${port}`);
});
