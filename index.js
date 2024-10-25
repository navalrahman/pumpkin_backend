import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoute from './routes/userRoute.js'

dotenv.config()

const port = process.env.PORT || 5000

const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));


app.use('/api/users', userRoute)


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Mongodb Connected");

    } catch (error) {
        console.log("error", error.message);
        process.exit(1)
    }

}
connectDB()


app.listen(port, () => {
    console.log(`server running on ${port}`);

})