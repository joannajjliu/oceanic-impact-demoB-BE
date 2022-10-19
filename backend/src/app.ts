import express from 'express';
import indexRouter from './routes/index.route';

const app = express();

app.use('/', indexRouter); // Mount the indexRouter to the root path

export default app;