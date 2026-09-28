import "dotenv/config";
import mongoose from "mongoose";

const uri=process.env.MONGODB_URI;

//if mongodb uri missing
if(!uri) {
    console.error("MONGODB_URI is missing, create .env in server")
    process.exit(1)
}

try{
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`connected -> db: "${mongoose.connection.name}", host: ${mongoose.connection.host}`);
    const ping = await mongoose.connection.db.admin().command({ ping:1 });
    console.log("ping results: ", ping);
} catch (err){
    console.error("Connection failed: ", err.message);
    process.exitCode=1;
} finally {
    await mongoose.disconnect();
}