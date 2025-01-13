const stripe = require("stripe")(
  "sk_test_51QSUx7FoIMmnFUOjWZPI476n1BuQQZKs0jUV2jGC5wCMKA07S3GWKW4woccsdBjLXlS7MEJJoSoSZV5RBg9F1uQb004cTp0Nor"
);

stripe.products
  .create({
    name: "Starter Subscription",
    description: "$12/Month subscription",
  })
  .then((product) => {
    stripe.prices
      .create({
        unit_amount: 200,
        currency: "usd",
        recurring: {
          interval: "month",
        },
        product: product.id,
      })
      .then((price) => {
        console.log("Success! Here is your starter subscription product id: " + product.id);
        console.log("Success! Here is your starter subscription price id: " + price.id);
      });
  });
