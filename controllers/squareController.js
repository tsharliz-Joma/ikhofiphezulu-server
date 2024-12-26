const { ApiError, client: square } = require("../square");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config({ path: "./config.env" });

const getToken = async (req, res) => {
  const response = await client.oAuthApi.obtainToken({
    clientID: "",
    clientSecret: "",
    code: "",
    grantType: "",
  });
};

const getCatalog = async (req, res) => {
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
      // this is where we create the object we assign the name with the obj.id
        items[obj.id] = {
          id: obj.id,
          name: obj.itemData.name,
          categoryId: obj.itemData.reportingCategory.id,
          imageIds: obj.itemData.imageIds || [],
          taxIds: obj.itemData.taxIds || [],
          modifierListIds: obj.itemData.modifierListInfo?.map((info) => info.modifierListId) || [],
          variations: obj.itemData.variations,
        };
        break;

      case "CATEGORY":
        categories[obj.id] = {
          id: obj.id,
          name: obj.categoryData.name,
        };
        break;

      case "IMAGE":
        images[obj.id] = {
          id: obj.id,
          name: obj.imageData.name,
          url: obj.imageData.url,
        };

      default:
        break;
    }
  });

  // We use forEach here because we are adding the data directly there is no need to return a new array, we are just checkin
  data.relatedObjects.forEach((obj) => {
    if (obj.type === "TAX") {
      // here is the object 
      taxes[obj.id] = {
        id: obj.id,
        name: obj.taxData.name,
        percentage: obj.taxData.percentage,
      };
    } else if (obj.type === "MODIFIER_LIST") {
      modifiers[obj.id] = {
        id: obj.id,
        name: obj.modifierListData.name,
        modifiers: obj.modifierListData.modifiers,
      };
    }
  });

  return { items, categories, images, taxes, modifiers };
};

// Get specific item
const getCatalogItem = async (req, res) => {
  try {
    const response = await square.catalogApi.retrieveCatalogObject(null, true);
    console.log(response.result);
  } catch (error) {
    console.logg(error);
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
    return res.json({ status: "ok", data: response });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { createPayment, getCatalog };
