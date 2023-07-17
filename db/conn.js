const mongoose = require('mongoose')
mongoose.set('strictQuery', true);
async function connectDb() {
    try {
        await mongoose.connect(process.env.database, {
            useNewUrlParser: true
        });
        console.log("Database connected successfully!")
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDb;