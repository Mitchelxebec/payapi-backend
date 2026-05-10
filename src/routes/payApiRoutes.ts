import { Router } from "express";
import gatewayMiddleware from "../middleware/payApiMiddleware";
import getCryptoPrice from "../controllers/cryptoPrice";
import getNews from "../controllers/newsController";
import getAiSearch from "../controllers/aiSearchController";

const router = Router();

// --- PROTECTED DATA ROUTES (The Bouncer is active here) ---

// Protect Crypto
router.get("/crypto-price", gatewayMiddleware("Crypto API"), getCryptoPrice);

// Protect News
router.get("/news", gatewayMiddleware("News API"), getNews);

// Protect AI Search
router.get("/ai-search", gatewayMiddleware("AI Search API"), getAiSearch);

export default router;