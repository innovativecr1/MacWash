const express = require("express");

const cors = require("cors");

const admin = require("firebase-admin");

const app = express();

require("dotenv").config();

const Razorpay =
require("razorpay");

const razorpay =
new Razorpay({

  key_id:
  process.env.RAZORPAY_KEY_ID,

  key_secret:
  process.env.RAZORPAY_KEY_SECRET

});
// MIDDLEWARE
app.use(cors());

app.use(express.json());

// SERVE HTML
app.use(
  express.static("public")
);

// FIREBASE KEY
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

// FIREBASE INIT
admin.initializeApp({

  credential:
  admin.credential.cert(
    serviceAccount
  ),

  databaseURL:
 "https://macwash-4310d-default-rtdb.asia-southeast1.firebasedatabase.app/"

});

const db =
admin.database();

// TEST ROUTE
app.get("/", (req,res)=>{

  res.send(
    "McWash Server Running"
  );

});
// CREATE ORDER
app.post(

  "/create-order",

  async (req,res)=>{

    try{

      const amount =
      req.body.amount;

      const options = {

        amount:
        amount * 100,

        currency:"INR"

      };

      const order =
      await razorpay.orders.create(
        options
      );

      res.json({

  ...order,

  key_id:
  process.env.RAZORPAY_KEY_ID

}); 

    }

    catch(err){

      console.log(err);

      res.status(500).send(
        "Order Error"
      );

    }

  }

);
// PAYMENT ROUTE
// PAYMENT SUCCESS
app.post(

  "/payment-success",

  async (req,res)=>{

    try{

      const {
        machine,
        mins
      } = req.body;

      console.log(
        "Machine:",
        machine
      );

      console.log(
        "Minutes:",
        mins
      );

      // TURN ON
      await db.ref(machine).set({

        Mins: mins,

        Status: "On"

      });

      console.log(
        "Machine ON"
      );

      // TIMER
      setTimeout(async ()=>{

        await db.ref(machine).set({

  Mins: mins,

  Status: "Off"

});

        console.log(
          "Machine OFF"
        );

      },

       mins * 60 * 1000

      );

      res.json({

        success:true

      });

    }

    catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }

);
// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server Running On Port " + PORT);
});