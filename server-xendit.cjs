// server-xendit.cjs
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Xendit } = require("xendit-node");
const admin = require("firebase-admin");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ====== CONFIG ======
const PORT = process.env.PORT || 5000;
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY; // contoh: xnd_development_...
const FIREBASE_SA_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH; // path ke serviceAccountKey.json

if (!XENDIT_SECRET_KEY) {
  console.error("Missing XENDIT_SECRET_KEY in .env");
  process.exit(1);
}
if (!FIREBASE_SA_PATH || !fs.existsSync(FIREBASE_SA_PATH)) {
  console.error("Missing/invalid FIREBASE_SERVICE_ACCOUNT_PATH in .env");
  process.exit(1);
}

// ====== Initialize Xendit & Firebase Admin ======
const xendit = new Xendit({ secretKey: XENDIT_SECRET_KEY });
const { QrCode } = xendit;
const qr = new QrCode({});

const serviceAccount = require(FIREBASE_SA_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const firestore = admin.firestore();

// ====== Helper ======
async function saveOrderToFirestore(order) {
  // order: { orderId, userId, coins, amount, status, createdAt, qris }
  await firestore.collection("orders").doc(order.orderId).set(order);
}

// ====== Create QRIS transaction ======
app.post("/create-transaction", async (req, res) => {
  try {
    // expected body: { price, coins, userId, itemName }
    const { price, coins, userId, itemName } = req.body;
    if (!price || !coins || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const orderId = `order-${Date.now()}`;

    // Create dynamic QR
    const qrData = await qr.createCode({
      externalID: orderId,
      type: "DYNAMIC", // dynamic QR
      amount: price,
      callbackURL:
        process.env.XENDIT_CALLBACK_URL ||
        `${req.protocol}://${req.get("host")}/xendit-callback`,
      // you can add additional info in callback if needed
    });

    // qrData contains qrString and qrCodeURL (qrCodeURL usually is image)
    const payload = {
      orderId,
      userId,
      coins,
      amount: price,
      itemName: itemName || `${coins} Coin`,
      status: "PENDING",
      qris: {
        qrString: qrData.qrString,
        qrCodeURL: qrData.qrCodeURL,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save order to Firestore
    await saveOrderToFirestore(payload);

    return res.json({
      success: true,
      orderId,
      qris_string: qrData.qrString,
      qris_url: qrData.qrCodeURL,
    });
  } catch (e) {
    console.error("create-transaction error:", e);
    return res
      .status(500)
      .json({ success: false, message: e.message || "Failed" });
  }
});

// ====== Xendit callback (webhook) ======
// Xendit will POST updates (check Xendit docs for exact body fields)
app.post("/xendit-callback", async (req, res) => {
  try {
    const body = req.body;
    console.log("Xendit callback:", JSON.stringify(body, null, 2));

    // Example Xendit callback shape:
    // { external_id, id, status, amount, ... }
    // We'll look for external_id (our orderId) and status "COMPLETED" (exact status name may be "COMPLETED" or "PAID" depending on Xendit)
    const externalId =
      body.external_id ||
      body.externalId ||
      (body.data && body.data.external_id);
    const status = body.status || (body.data && body.data.status) || null;

    if (!externalId) {
      console.warn("No external_id in callback");
      return res.status(400).json({ message: "No external_id" });
    }

    // Fetch order doc
    const orderRef = firestore.collection("orders").doc(externalId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      console.warn("Order not found:", externalId);
      // still respond 200 so Xendit won't retry too often
      return res.json({ ok: true });
    }
    const order = orderSnap.data();

    // Normalize possible status values (Xendit uses 'COMPLETED' for QR)
    // Check Xendit docs or body content; adjust checks accordingly.
    if (status === "COMPLETED" || status === "PAID" || status === "SETTLED") {
      // Update user's coin in Firestore (use transaction)
      const userRef = firestore.collection("users").doc(order.userId);

      await firestore.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) {
          throw new Error("User not found");
        }
        const currentCoins = userDoc.data().coins || 0;
        const newCoins = currentCoins + (order.coins || 0);
        t.update(userRef, { coins: newCoins });
      });

      // Update order status
      await orderRef.update({
        status: "COMPLETED",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        rawCallback: body,
      });

      console.log(
        `Order ${externalId} marked COMPLETED and coins added to user ${order.userId}`
      );
    } else {
      // other statuses -> update order doc
      await orderRef.update({
        status: status || "UNKNOWN",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        rawCallback: body,
      });
      console.log(`Order ${externalId} status updated: ${status}`);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("xendit-callback error:", err);
    return res.status(500).json({ message: "Error" });
  }
});

// ====== Get order status (frontend polling) ======
app.get("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const doc = await firestore.collection("orders").doc(orderId).get();
    if (!doc.exists)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    return res.json({ success: true, order: doc.data() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ====== Start server ======
app.listen(PORT, () => {
  console.log(`Xendit server running on port ${PORT}`);
});
