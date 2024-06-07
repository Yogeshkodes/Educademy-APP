const mongoose = requrie("mongoose");

requrie("dotenv").config();

exports.connect = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB connected succesfully"))
    .catch((error) => {
      console.log("Something went wrong");
      console.error(error);
      process.exit(1);
    });
};
