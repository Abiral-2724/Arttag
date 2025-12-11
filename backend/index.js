import express from 'express' ;
import dotenv from 'dotenv'
// import client from './prisma.js';
import cors from 'cors'
import userRoute from './routes/user.routes.js'
import categoryRoute from './routes/category.routes.js'
import productRoute from './routes/product.routes.js'
import wishListRoute from './routes/wishlist.routes.js'
import cartRoute from './routes/cart.routes.js'
import orderRoute from './routes/order.routes.js'
import coupenRoute from './routes/coupen.routes.js'

const app = express() ; 

dotenv.config({}) ; 

const PORT = process.env.PORT || 8000 ; 


app.use(express.json()) ;
app.use(express.urlencoded({extended : true})) ; 

const corsOptions = {
    origin: 'https://www.arttag.in',
    credentials: true, 
};


app.use(cors(corsOptions)) ; 

app.use('/api/v1/user' ,userRoute) ;

app.use('/api/v1/product' ,productRoute)

app.use('/api/v1/category' ,categoryRoute)

app.use('/api/v1/wishlist' ,wishListRoute) ;

app.use('/api/v1/cart' ,cartRoute)

app.use('/api/v1/order' ,orderRoute);

app.use('/api/v1/coupen' ,coupenRoute);


app.listen(PORT ,() => {
    console.log(`Server running at ${PORT}`) ; 
})