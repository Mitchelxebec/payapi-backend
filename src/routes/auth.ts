import { Router } from "express";
import verifyPayment from "../controllers/verifyPayment";
import {
  getKeys,
  getRecentActivity,
  revokeKey,
} from "../controllers/apiKeyController";
import { validate } from "../middleware/validate";
import {
  revokeKeySchema,
  verifyPaymentSchema,
} from "../validations/apiKeyValidation";
import getServiceInfo from "../controllers/getServiceInfo";

const router = Router();

// ---  OPEN ROUTES (Management & Payment) ---
router.get("/services", getServiceInfo);
router.post("/verify-payment", validate(verifyPaymentSchema), verifyPayment);
router.get("/keys", getKeys);
router.post("/keys/revoke", validate(revokeKeySchema), revokeKey);
router.get("/activity", getRecentActivity);

export default router;
