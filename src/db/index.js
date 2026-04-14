import mongoose from "mongoose";

export const connectdb = async () => {
    try{
        const connectionRes = await mongoose.connect(`${process.env.MONGO_DB}`)
        console.log("DB connected successfully", connectionRes.connection.host)
    }
    catch(err){
        console.log("DB connection error", err)
        process.exit(1);
    }
}