import { Router } from "express";
import { ProductController } from "../../src/controller/ProductController";
import { authMiddleware, adminOnly } from "../middlewares/authMiddleware";

const router = Router();
const controller = new ProductController();

router.get("/", controller.list);
router.post("/", authMiddleware, adminOnly, controller.create);
router.put("/:id", authMiddleware, adminOnly, controller.update);
router.delete("/:id", authMiddleware, adminOnly, controller.remove);

export default router;
