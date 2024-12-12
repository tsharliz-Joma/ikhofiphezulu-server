const stripe = require("stripe")(
  "sk_test_51QSUx7FoIMmnFUOjWZPI476n1BuQQZKs0jUV2jGC5wCMKA07S3GWKW4woccsdBjLXlS7MEJJoSoSZV5RBg9F1uQb004cTp0Nor"
);

const DOMAIN = "http://localhost:3000";

const createCheckoutSession = async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: req.body.map((item) => {}),
    mode: "payment",
    success_url: `${DOMAIN}/success=true`,
    cancel_url: `${DOMAIN}/cancel=false`,
  });

  res.redirect(303, session.url);
};

module.exports = { createCheckoutSession };
