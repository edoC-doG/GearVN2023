const { default: mongoose } = require('mongoose');

const dbConnect = async () => {
    try {

        const conn = await mongoose.connect(process.env.MONGODB_URI);
        if (conn.connection.readyState === 1) console.log("Connections Successfully")
        else console.log('DB Connection is Failed');
    } catch (error) {
        console.log('DB Connection is Failed');
        throw new Error(error);
    }
}

module.exports = dbConnect;