const {ApiError, client: square} = require("../lib/square");
const {v4: uuidv4} = require("uuid");
const {formatPriceAUD} = require("../lib/helperFunctions");
require("dotenv").config({path: "./config.env"});

const getToken = async (req, res) => {
  const response = await client.oAuthApi.obtainToken({
    clientID: "",
    clientSecret: "",
    code: "",
    grantType: "",
  });
};

const getCatalog = async (req, res) => {
  try {
    const response = await square.catalogApi.searchCatalogObjects({
      objectTypes: ["ITEM", "CATEGORY", "IMAGE"], // Fetch both menu items and categories
      includeRelatedObjects: true,
      include_deleted_objects: false,
    });

    const items = {};
    const categories = {};
    const images = {};
    const taxes = {};
    const modifiers = {};

    const data = response.result;

    // Here we are creating a new object (mutating) by combining specific fields so we use map, we need a return value
    data.objects.map((obj) => {
      switch (obj.type) {
        case "ITEM":
          items[obj.itemData.name] = {
            id: obj.id,
            name: obj.itemData.name,
            description: obj.itemData.descriptionPlaintext,
            categoryId: obj.itemData.categories[0].id,
            imageIds: obj.itemData.imageIds || [],
            taxIds: obj.itemData.taxIds || [],
            modifierListIds:
              obj.itemData.modifierListInfo?.map(
                (info) => info.modifierListId,
              ) || [],
            variations: obj.itemData.variations,
            basePriceMoney: {
              amount:
                obj.itemData.variations[0].itemVariationData.priceMoney.amount,
              currency: "AUD",
            },
          };

          break;

        case "CATEGORY":
          categories[obj.id] = {
            id: obj.id,
            name: obj.categoryData.name,
            imageId: obj.categoryData.imageIds
              ? obj.categoryData.imageIds[0]
              : null,
          };
          break;

        case "IMAGE":
          images[obj.id] = {
            id: obj.id,
            name: obj.imageData.name,
            url: obj.imageData.url,
          };
          break;

        default:
          break;
      }
    });

    // We use forEach here because we are cçadding the data directly there is no need to return a new array, we are just checkin
    data.relatedObjects.forEach((obj) => {
      if (obj.type === "TAX") {
        taxes[obj.id] = {
          id: obj.id,
          name: obj.taxData.name,
          percentage: obj.taxData.percentage,
        };
      } else if (obj.type === "MODIFIER_LIST") {
        modifiers[obj.id] = {
          id: obj.id,
          name: obj.modifierListData.name,
          options: obj.modifierListData.modifiers?.map((item) => ({
            catalogObjectId: item.id,
            id: item.id,
            name: item.modifierData.name,
            price: formatPriceAUD(item.modifierData.priceMoney.amount),
          })),
        };
      }
    });

    // I need to attach the images to their respective categories
    Object.values(categories).forEach((category) => {
      if (category.imageId && images[category.imageId]) {
        category.image = images[category.imageId].url;
      } else {
        category.image = "";
      }
    });

    // Transform modifiers into an array format when attaching to items
    Object.values(items).forEach((item) => {
      item.modifiers = item.modifierListIds
        .map((modListId) => {
          const modifier = modifiers[modListId];
          return modifier
            ? {
                catalogObjectId: modifier.id, // Modifier ID
                name: modifier.name, // Modifier Name
                quantity: "1", // Default quantity
              }
            : null;
        })
        .filter(Boolean); // Filter out any null values
    });

    Object.values(items).forEach((item) => {
      // Attach category items
      if (item.categoryId && categories[item.categoryId].id) {
        // Initialize the items array if it doesn't exist
        if (!categories[item.categoryId].items) {
          categories[item.categoryId].items = [];
        }
        categories[item.categoryId].items.push(item);
      }

      // Attach images to items
      if (item.imageIds && images[item.imageIds[0]]) {
        item.image = images[item.imageIds].url;
      }

      item.modifiers = item.modifierListIds
        .map((modListId) => {
          const modifier = modifiers[modListId];
          return modifier
            ? {id: modifier.id, name: modifier.name, options: modifier.options}
            : null;
        })
        .filter(Boolean);
    });

    // console.log(items.Latte.variations[0]);
    return res.json({
      status: "ok",
      data: {items, categories, images, taxes, modifiers},
    });
  } catch (error) {
    console.log(error.errors);
    console.error("Error fetching catalog:", error.message);
    return res.status(500).json({status: "error", message: error.message});
  }
};

// Get specific item
const getCatalogItem = async (req, res) => {
  const itemId = req.params.id;
  try {
    const response = await square.catalogApi.retrieveCatalogObject(
      itemId,
      true,
    );
    return response?.data;
  } catch (error) {
    console.log(error);
  }
};

const createPayment = async (req, res) => {
  try {
    const idempotencyKey = req.idempotencyKey || uuidv4(); // This checks if there is a idempotencyKey created if not it uses nanoid to generate one
    const order = {
      idempotencyKey,
      order: req.body,
    };
    const response = await square.checkoutApi.createPaymentLink(order);
    return res.json({status: "ok", data: response});
  } catch (error) {
    console.log(error.errors);
    res.status(500).json({status: "error", message: error.message});
  }
};

module.exports = {createPayment, getCatalog, getCatalogItem};
