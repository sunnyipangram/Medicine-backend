require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const bodyParser = require('body-parser');
const port = process.env.PORT || 8001;
const app = express();
const axios = require('axios');
const router = require('express').Router();
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '15gb', extended: true }));
app.use(bodyParser.json({ limit: '15gb' }));

const { sendEmail } = require('./nodemailorFun');
const { contactUsMail } = require('./contactUsMail');

const { becomeADriver } = require('./becomeADriver');
const { becomeAPartner } = require('./becomeAPartner');
const { rejectMail } = require('./RejectMail');
const firebaseAdmin = require('./firebaseConfig');

const crypto = require('crypto');
const Razorpay = require('razorpay');


// razorpay integration test start

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

router.post('/razorpay', async (req, res) => {
  console.log(req.body.amount);

  var options = {
    amount: Number(req.body.amount * 100), // amount in the smallest currency unit
    currency: 'INR',
    receipt: `order_rcptid_11${Math.random()}`,
  };

  instance.orders.create(options, function (err, order) {
    console.log('order', order);
    console.log('err', err);
    res.status(200).json({
      success: true,
      data: order,
    });
  });
});
router.get('/get-razorpay-api-key', async (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

router.post('/razorpay-success', async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const body = razorpayOrderId + '|' + razorpayPaymentId;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpaySignature;
  console.log(isAuthentic, expectedSignature, razorpaySignature);




  if (isAuthentic) {
    // Database operations can go here'
    const handleUpdateOrderStatus = async (paymentStatus, razorpayPaymentId) => {
      const orderRef = firebaseAdmin.firestore().collection('restaurant_orders');

      const snapshot = await orderRef
        .where('razorpayPaymentId', '==', razorpayPaymentId)
        .get();

      if (snapshot.empty) {
        return;
      } else {
        snapshot.forEach((doc) => {
          const data = doc.data();
          orderRef.doc(data.id).update({
            paymentStatus: paymentStatus,
          });
        });
      }
    };
    if (razorpayPaymentId) {
      await handleUpdateOrderStatus('Paid', razorpayPaymentId);
      console.log('Payment received', razorpayPaymentId);
    }
    res.status(200).json({ success: true, message: 'Payment received' });
  } else {
    if (!razorpayPaymentId) {
      await handleUpdateOrderStatus('Failed', razorpayPaymentId);
      console.log('Payment Failed', razorpayPaymentId);
    }
    res.status(400).json({ success: false, message: 'Transaction not legit' });
  }
});

// razorpay integration test end

router.post('/authorize-token', async (req, res) => {
  const data = req.body;

  try {
    const response = await stripe.oauth.token({
      grant_type: data.grant_type,
      code: data.code,
    });
    res.status(200).json(response);
  } catch (error) {
    console.log('error', error.message);
    res.status(500).json(error);
  }
});

router.post('/deauthorize-token', async (req, res) => {
  const data = req.body;
  try {
    const response = await stripe.oauth.deauthorize({
      client_id: data.clientId,
      stripe_user_id: data.stripeUserId,
    });
    console.log('response', response);
    res.status(200).json(response);
  } catch (error) {
    console.log('error', error.message);
    res.status(500).json(error);
  }
});

router.post('/send-email', async (req, res) => {
  try {
    const data = req.body;
    sendEmail(data);
    res.status(200).json(data);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post('/reject-email', async (req, res) => {
  try {
    const data = req.body;
    rejectMail(data);
    res.status(200).json(data);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post('/send-contactus-email', async (req, res) => {
  try {
    const data = req.body;
    contactUsMail(data);
    res.status(200).json(data);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post('/become-a-driver-email', async (req, res) => {
  try {
    const data = req.body;
    becomeADriver(data);
    res.status(200).json(data);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post('/become-a-partner-email', async (req, res) => {
  try {
    const data = req.body;
    becomeAPartner(data);
    res.status(200).json(data);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post('/digital-id', async (req, res) => {
  const body = req.body;
  const code = req.query.code;
  const response = await axios
    .post(
      // `https://api.digitalid-sandbox.com/oauth2/token?redirect_uri=https://digitalid-sandbox.com/oauth2/echo&grant_type=authorization_code&code=${code}`,
      `https://api.digitalid.com/oauth2/token?redirect_uri=https://digitalid.com/oauth2/echo&grant_type=authorization_code&code=${code}`,
      {},
      {
        headers: {
          Authorization: `Basic ${process.env.DIGITAL_ID_TOKEN_LIVE}`,
          // Authorization: `Basic ${process.env.DIGITAL_ID_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    .then((response) => res.status(200).json(response.data))
    .then((resp) => {
      res.status(200).resp;
    })
    .catch((err) => console.log('error', err));
});

router.post('/getdist', async (req, res) => {

  const data = req.body;
  console.log(data);
  //   `https://maps.googleapis.com/maps/api/distancematrix/json?origins=40.6655101%2C-73.89188969999998&destinations=40.659569%2C-73.933783%7C40.729029%2C-73.851524%7C40.6860072%2C-73.6334271%7C40.598566%2C-73.7527626&key=AIzaSyDrUmQbDUw6G6eI88p6rXR8e6ak3TDvlz8`,
  // res.send(req.body)
  var config = {
    method: 'get',
    url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=heading%3D90%3A${data.lat1}%2C${data.lng1}&destinations=${data.lat2}%2C${data.lng2}&key=AIzaSyCZT5iv7UaQiN5viNiStg9Ort4-DLOLeTw`,
    headers: {},
  };
  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      res.status(200).json(response.data);
      // res.send(JSON.stringify(response.data))
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post('/change-user-password', async (req, res) => {
  try {
    const id = req.body.id;
    const password = req.body.password;
    const email = req.body.email;
    // const user = await firebaseAdmin.auth().getUserByEmail(email);
    if (email) {
      await firebaseAdmin.auth().updateUser(id, {
        email: email,
      });
      await firebaseAdmin.firestore().collection('users').doc(id).update({
        email: email,
      });
    } else {
      await firebaseAdmin.auth().updateUser(id, {
        password: password,
      });
      await firebaseAdmin.firestore().collection('users').doc(id).update({
        password: password,
      });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.post('/change-driver-password', async (req, res) => {
  console.log(req.body)
  try {
    const id = req.body.id;
    const password = req.body.password;
    const email = req.body.email;
    // const user = await firebaseAdmin.auth().getUserByEmail(email);
    if (email) {
      // console.log(email,"email")
     await firebaseAdmin.auth().updateUser(id, {
        
        email: email,
      });
      let res=     await firebaseAdmin.firestore().collection('drivers').doc(id).update({
        email: email,
      });
      console.log(res)
    } else {
      // console.log(password,"password")
      await firebaseAdmin.auth().updateUser(id, {
        password: password,
      });
      let res=    await firebaseAdmin.firestore().collection('drivers').doc(id).update({
        password: password,
      });
      console.log(res)
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
    console.log(error.message)
  }
});

router.post('/change-vendour-password', async (req, res) => {
  try {
    const id = req.body.id;
    const password = req.body.password;
    const email = req.body.email;
    // const user = await firebaseAdmin.auth().getUserByEmail(email);
    if (email) {
      await firebaseAdmin.auth().updateUser(id, {
        email: email,
      });
      await firebaseAdmin.firestore().collection('vendors').doc(id).update({
        email: email,
      });
    } else {
      await firebaseAdmin.auth().updateUser(id, {
        password: password,
      });
      await firebaseAdmin.firestore().collection('vendors').doc(id).update({
        password: password,
      });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.post('/change-admin-password', async (req, res) => {
  console.log(req.body)
  try {
    const id = req.body.id;
    const password = req.body.password;
    const email = req.body.email;
    // const user = await firebaseAdmin.auth().getUserByEmail(email);
    if (email) {
      await firebaseAdmin.auth().updateUser(id, {
        email: email,
      });
      await firebaseAdmin.firestore().collection('users').doc(id).update({
        password: email,
      });
    } else {
      await firebaseAdmin.auth().updateUser(id, {
        password: password,
      });
      await firebaseAdmin.firestore().collection('users').doc(id).update({
        password: password,
      });
    }
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.post('/send-notification', async (req, res) => {
  try {
    const { notification, token, android } = req.body;
    const message = {
      notification: notification,
      android: android,
      tokens: token,
    };
    const response = await firebaseAdmin.messaging().sendMulticast(
      message,
      // {
      //   token,
      //   notification: notification,
      //   android: android,
      // }
    );
    console.log('response', response);
    res.status(200).json({ message: 'Successfully sent notifications!' });
  } catch (error) {
    res.json({ message: error.message || 'Something went wrong!' });
  }
});

router.post('/createStripeCheckoutSession', async (req, res) => {
  // console.log('req: ', req.body);
  res.set('Access-Control-Allow-Origin', '*');

  const { products, shipping } = req.body;

  if (!products) {
    return res.json({ message: 'Products required' });
  }

  if (products && products.length === 0) {
    return res.json({ message: 'Products required' });
  }

  const orderRedProducts = products.map((item) => {
    const product = {
      price_data: {
        currency: 'USD',
        product_data: {
          name: item.name,
          description: item.description,
          images: [item.photo],
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    };
    return product;
  });

  const shippingArray = [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: shipping.rate * 100,
          currency: 'usd',
        },
        display_name: shipping.name,
      },
    },
  ];

  try {
    const sessionObj = {
      // userId:userId,
      // total_price: shipping.rate +total_price,
      line_items: orderRedProducts,
      mode: 'payment',
      success_url: `https://tastybites.ipangram.com/#/payment-success`,
      cancel_url: `https://tastybites.ipangram.com/#/payment-canceled`,
    };

    if (shipping.rate && shipping.name) {
      sessionObj.shipping_options = shippingArray;
    }

    const session = await stripe.checkout.sessions.create(sessionObj);

    res.json({
      paymentIntent: session.payment_intent,
      url: session.url,
    });
  } catch (err) {
    console.log('error creating stripe session checkout', err);
  }
});

router.post('/stripeWebHook', async (req, res) => {
  const event = req.body;
  // console.log('event: ', event);


  const paymentIntent = event.data.object.payment_intent;
  // userId = event.data.object.userId;
  // total_price=event.data.object.total_price;

  const handleUpdateOrderStatus = async (paymentStatus, paymentIntent) => {
    const orderRef = firebaseAdmin.firestore().collection('restaurant_orders');
  
    const snapshot = await orderRef
      .where('paymentIntent', '==', paymentIntent)
      .get();
  
    if (snapshot.empty) {
      return;
    } else {
      snapshot.forEach(async (doc) => {
        const data = doc.data();
        await orderRef.doc(data.id).update({
          paymentStatus: paymentStatus,
        });
  
        // console.log('data: ', data);
  
       
        if (paymentStatus==="Paid"){
          const userDocRef = firebaseAdmin.firestore().collection('users').doc(data.authorID);
          const userDoc = await userDocRef.get();
    
          if (userDoc.exists) {
            const userData = userDoc.data();
            console.log('userData: ', userData);
            
            // console.log('  data.payableAmount: ',   data.payableAmount,userData.totalSpent);
           
       let resp= await userDocRef.update({
             
              lastOrder:  data.payableAmount,
              totalSpent: (userData.totalSpent || 0) + (data.payableAmount),
            });
      
        console.log('resp: ', resp);

          }
        }
       
      });
    }
  };
  
  

  switch (event.type) {
    case 'checkout.session.completed':
      if (paymentIntent) {
        handleUpdateOrderStatus('Paid', paymentIntent);
       
      }
      break;
    case 'checkout.session.expired':
      if (paymentIntent) {
        handleUpdateOrderStatus('failed', paymentIntent);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

//This endpoint only for mobile app
router.post('/createPaymentIntent', async (req, res) => {
  // res.set('Access-Control-Allow-Origin', '*');

  const { orderId, customerEmail, price } = req.body;

  if (!orderId) {
    return res.json({ error: 'Order id is required' });
  }

  if (!customerEmail) {
    return res.json({ error: 'Customer email is required' });
  }

  if (!price) {
    return res.json({ error: 'Price is required' });
  }

  const orderRef = firebaseAdmin.firestore().collection('restaurant_orders');

  const snapshot = await orderRef.where('id', '==', orderId).get();

  if (snapshot.empty) {
    return res.json({ error: 'Order not found' });
  }

  const stripeCustomer = await await stripe.customers.create({
    email: customerEmail,
    name: 'Jenny Rosen',
    address: {
      line1: '510 Townsend St',
      postal_code: '98140',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
    },
  });

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: stripeCustomer.id },
    { apiVersion: '2022-08-01' },
  );

  const paymentObj = {
    amount: price * 100,
    currency: 'USD',
    customer: stripeCustomer.id,
    receipt_email: customerEmail,
    description: 'PRODUCT',
    automatic_payment_methods: { enabled: true },
    // payment_method_types: ['card'],
  };

  const paymentIntent = await stripe.paymentIntents.create(paymentObj);

  snapshot.forEach((doc) => {
    const data = doc.data();
    orderRef.doc(data.id).update({
      paymentIntent: paymentIntent.id,
    });
  });

  return res.json({
    paymentIntent: paymentIntent.id,
    ephemeralKey: ephemeralKey.secret,
    customer: stripeCustomer.id,
    paymentIntentClientSecret: paymentIntent.client_secret,
  });
});

app.use('/api', router);
app.listen(port, () => {
  console.log(`server is running at this port ${port}`);
});
