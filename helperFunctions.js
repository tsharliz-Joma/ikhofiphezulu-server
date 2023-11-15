const User = require("./models/User");
const bcrypt = require("bcryptjs");

const coffeeObject = (req) => {
  const ikhofi = {
    name: req.body.name,
    number: req.body.number,
    coffeeName: req.body.coffeeName,
    coffeeMilk: req.body.coffeeMilk,
    coffeeSize: req.body.coffeeSize,
    getValues() {
      return {
        name: this.name,
        number: this.number,
        coffeeName: this.coffeeName,
        coffeeMilk: this.coffeeMilk,
        coffeeSize: this.coffeeSize,
      };
    },
  };
  return ikhofi.getValues();
};

const encrypt = async (req, len) => {
  const encryptedInfo = {
    name: req.body.name,
    bcryptEmail: req.body.email,
    email: req.body.email,
    bcryptPassword: req.body.password,
    bcryptNumber: req.body.mobileNumber,
    async encryptData() {
      return {
        name: this.name,
        email: this.email,
        bcryptPassword: await bcrypt.hash(this.bcryptPassword, len),
        bcryptEmail: await bcrypt.hash(this.bcryptEmail, len),
        bcryptNumber: await bcrypt.hash(this.bcryptNumber, len),
      };
    },
  };
  return await encryptedInfo.encryptData();
};

const decrypt = async (req, user) => {
  const validatedInfo = {
    email: req.body.email,
    password: req.body.password,
    async compareValues() {
      return {
        email: await bcrypt.compare(this.email, user.hashedEmail),
        password: await bcrypt.compare(this.password, user.password),
      };
    },
  };
  return await validatedInfo.compareValues();
};



module.exports = { coffeeObject, encrypt, decrypt };
