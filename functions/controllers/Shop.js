"use strict";

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripe = require("stripe")(
  "sk_test_51HCTMlKULAGg50zbU4900ETaFjtixWqbLQIzNd4FHiFYEizm3IXfHof2I6MWOjLAPXs9kYQlQB1jtctzBijzYdby00r7xPM4h7"
);
// const webhookSecret = 'whsec_SF9PEj4j6q7cYwQKiTWv5g0YUPsvcvs5';
// const webhookSecret = 'whsec_Me0F0ciWUZn2Qo4nkRgkm7uQxHHgF5GI';
const webhookSecret = 'whsec_ileSR4ivgqxyQ40k06Y7zrk86coEvI7S';


exports.createCart = (packageId, currency) => {
  return new Promise(async (resolve, reject) => {
    try {
      this.getPackageInformation(packageId, currency)
        .then(async packageInfo => {
          const {
            price,
            quantity,
            retailPrice,
            discount
          } = packageInfo;

          const newCartRef = await global.CartDB.add({
            packageId,
            currency,
            price,
            quantity,
            retailPrice,
            discount
          });
          resolve(newCartRef.id);
        })
        .catch(error => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

exports.updateCart = (packageId, currency, cartId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cartRef = await global.CartDB.doc(cartId).get();
      if (!cartRef.exists)
        return reject({
          status: 404,
          message: "This cart does not exist."
        });
      // const cart = cartRef.data();
      this.getPackageInformation(packageId, currency)
        .then(async packageInfo => {
          const {
            price,
            quantity,
            retailPrice,
            discount
          } = packageInfo;
          const cartUpdateRef = await global.CartDB.doc(cartId).update({
            packageId,
            currency,
            price,
            quantity,
            retailPrice,
            discount
          });
          resolve(cartUpdateRef);
        })
        .catch(error => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

exports.addEmailToCart = (cartId, email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cart = await this.getCart(cartId);
      const cartUpdateRef = await global.CartDB.doc(cartId).update({
        email
      });
      resolve(cartUpdateRef);
    } catch(error) {
      reject(error);
    }
  })
}

exports.getCoupon = couponId => {
  return new Promise(async (resolve, reject) => {
    try {
      const couponRef = await global.CouponsDB.doc(couponId).get();
      if (!couponRef.exists)
        return reject({
          status: 404,
          message: `Coupon ${couponId} does not exist`
        });
      resolve(couponRef.data());
    } catch (error) {
      reject(error);
    }
  });
};

exports.getCart = cartId => {
  return new Promise(async (resolve, reject) => {
    try {
      const cartRef = await global.CartDB.doc(cartId).get();
      if (!cartRef.exists)
        return reject({
          status: 404,
          message: `Cart ${cartId} does not exist`
        });
      resolve(cartRef.data());
    } catch (error) {
      reject(error);
    }
  });
};

exports.addCouponToCart = (couponId, cartId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cart = await this.getCart(cartId);
      const coupon = await this.getCoupon(couponId);
      const cartRef = await global.CartDB.doc(cartId).update({
        coupon: couponId
      });
      resolve({
        coupon
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.getAddon = addonId => {
  return new Promise(async (resolve, reject) => {
    try {
      const addonRef = await global.AddonsDB.doc(addonId).get();
      if (!addonRef.exists)
        return reject({
          status: 404,
          message: `Addon ${addonId} does not exist`
        });
      resolve(addonRef.data());
    } catch (error) {
      reject(error);
    }
  });
};

exports.addAddonToCart = (addonId, cartId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cart = await this.getCart(cartId);
      let addons = cart.addons;
      if (addons != undefined) {
        if (addons.includes(addonId))
          return reject({
            status: 403,
            message: `Addon ${addonId} is already in your cart.`
          });
      } else {
        addons = [];
      }
      const updatedAddons = [addonId, ...addons];
      const addon = await this.getAddon(addonId);
      const cartRef = await global.CartDB.doc(cartId).update({
        addons: updatedAddons
      });
      resolve({
        addons: updatedAddons
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.removeAddonFromCart = (addonId, cartId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const addon = await this.getAddon(addonId);
      const cart = await this.getCart(cartId);
      let addons = cart.addons;
      if (!addons.includes(addonId))
        return reject({
          status: 403,
          message: `Addon ${addonId} is not in your cart.`
        });
      addons.splice(addons.indexOf(addonId), 1);
      const cartRef = await global.CartDB.doc(cartId).update({
        addons
      });
      resolve(addons);
    } catch (error) {
      reject(error);
    }
  });
};

exports.getRegionalPricing = currency => {
  return new Promise(async (resolve, reject) => {
    try {
      const ref = await global.PricingDB.doc(currency).get();
      if (!ref.exists)
        return reject({
          status: 404,
          message: `Currency ${currency} does not exist`
        });
      const ref2 = await global.AddonsDB.limit(5).get();

      let addons = {};
      ref2.forEach(doc => {
        // addons.push(doc.id, {
        // id: doc.id,
        // ...doc.data()
        // });
        addons[doc.id] = doc.data();
      });

      return resolve({
        pricing: ref.data(),
        addons
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.getPackageInformation = (packageId, currency) => {
  return new Promise(async (resolve, reject) => {
    try {
      let pricing = await this.getRegionalPricing(currency);
      pricing = pricing.pricing.pricing;
      pricing.forEach(packageD => {
        if (packageD.package == packageId) return resolve(packageD);
      });

      reject({
        message: "This package does not exist."
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.calculateOrderAmount = (packageId, currency, addons, coupon) => {
  return new Promise(async (resolve, reject) => {
    try {
      let totalAmount = 0;
      // Add cost of coaster
      let {
        price,
        freeShipping
      } = await this.getPackageInformation(
        packageId,
        currency
      );

      console.log({
        freeShipping
      })
      const shippingCost = freeShipping ? 0 : 3; // Shipping cost hardcoded to 3.00 for the moment
      totalAmount += parseInt(price) + parseInt(shippingCost);
      console.log({
        totalAmount
      })
      // totalAmount += parseInt(price);

      // Add cost of addons
      if (addons) {
        addons.forEach(async (addon) => {
          let {
            price
          } = await this.getAddon(addon);
          console.log({
            addon,
            price
          })
          if (addon == 'shipping' && addons.includes('shipping')) {
            addons.splice(addons.indexOf('shipping'), 1);
          } else {
            totalAmount += parseInt(price);
          }
        });
      }
      console.log({
        totalAmount
      })
      // Take away discount :D
      if (coupon) {
        // let { discount } = coupon ? await this.getCoupon(coupon) : { discount: 0 };
        let {
          discount
        } = await this.getCoupon(coupon);
        totalAmount -= parseInt(discount);
      }

      totalAmount *= 100; // Total must be multiplied by 100 as Stripe deals in cents not euros
      resolve(totalAmount);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

exports.getPaymentIntent = (paymentIntent) => {
  return new Promise(async (resolve, reject) => {
    try {
      const paymentResp = await stripe.paymentIntents.retrieve(
        paymentIntent
      );
      resolve(paymentResp);
    } catch(error) {
      reject(error);
    }
  });
}

exports.createPayment = (cartId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        currency,
        coupon,
        packageId,
        addons
      } = await this.getCart(cartId);
      const amount = await this.calculateOrderAmount(
        packageId,
        currency,
        addons,
        coupon
      );

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ["card"],
        metadata: {
          cartId
        }
      });

      resolve(paymentIntent);
    } catch (error) {
      reject(error);
    }
  });
};

exports.createOrder = (cart, stripe) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orderRef = await global.OrdersDB.add({
        cart,
        stripe,
        fulfilled: false,
        assignedTo: 'Dukes'
      });
      resolve(orderRef.id);
    } catch (error) {
      reject(error);
    }
  });
}

exports.confirmOrder = (requestBody, signature) => {
  return new Promise(async (resolve, reject) => {
    try {
      const event = stripe.webhooks.constructEvent(requestBody, signature, webhookSecret);
      const intent = event.data.object;
      global.logger.log(event);
      if (event.type == 'payment_intent.succeeded') {
        const cartId = intent.metadata.cartId;
        const cart = await this.getCart(cartId);
        const {
          currency,
          coupon,
          packageId,
          addons
        } = cart;
        const amount = await this.calculateOrderAmount(packageId, currency, addons, coupon);
        if (amount == intent.amount && currency == intent.currency) {
          const stripe = intent.charges.data[0];
          const orderId = await this.createOrder(cart, stripe);
          global.logger.log("Order id", {
            orderId
          })
          return resolve(orderId);
        } else {
          // INCORRECT QUANTITY PAID OR CURRENCY
          return reject({
            message: "Incorrect quantity or currency",
            expectedCost: {
              amount,
              paid: intent.amount,
              currency,
              currencyUser: intent.currency
            }
          });
        }
      } else if (event.type == 'payment_intent.payment_failed') {
        const message = intent.last_payment_error && intent.last_payment_error.message;
        return reject({
          message
        });
      } else {
        return reject({
          status: 400,
          message: 'Untracked event. Could not process.'
        });
      }
      /* switch(event.type) {
        case 'payment_intent.succeeded':
          // eslint-disable-next-line no-case-declarations
          const cartId = intent.metadata.cartId;
          // eslint-disable-next-line no-case-declarations
          const cart = await this.getCart(cartId);
          // eslint-disable-next-line no-case-declarations
          // const { packageId, currency, addons, coupon } = cart;
          // eslint-disable-next-line no-case-declarations
          // console.log({ message: "Confirm order", packageId, currency, addons, coupon });
          // const totalCost = await this.calculateOrderAmount(packageId, currency, addons, coupon);
          const {
            currency,
            coupon,
            packageId,
            addons,
            quantity
          } = await this.getCart(cartId);
          const amount = await this.calculateOrderAmount(
            packageId,
            currency,
            addons,
            coupon
          );
          if(totalCost == intent.amount && currency == intent.currency) {
            const stripe = intent.charges.data[0];
            const orderId = await this.createOrder(cart, stripe);
            console.log({ orderId })
            global.logger.log("Order id", { orderId } )
            resolve(orderId);
          } else {
            reject({ message: "Incorrect quantity or currency", expectedCost: { totalCost, paid: intent.amount, currency, currencyUser: intent.currency } })
            // INCORRECT QUANTITY PAID OR CURRENCY
          }

          break;
        case 'payment_intent.payment_failed':
          // DIDNT GO THROUGH
          // eslint-disable-next-line no-case-declarations
          const message = intent.last_payment_error && intent.last_payment_error.message;
          reject({ message });
          break;
        default:
          // ANYTHING ELSE
          reject({ status: 400, message: 'Untracked event. Could not process.'});
          break;
      } */
    } catch (error) {
      console.error(error);
      reject(error);
    }
  })
}

// exports.confirmPaymentIntent = (paymentIntent, payment_method) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const intent = await stripe.paymentIntents.confirm(
//         paymentIntent,
//         payment_method
//       );
//       resolve(intent);
//     } catch (error) {
//       reject(error);
//     }
//   });
// };