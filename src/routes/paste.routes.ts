import { Router } from "express";

import {
  createPasteController,
  getPasteController,
} from "../controllers/paste.controller.js";

const pasteRouter = Router();

pasteRouter.post("/", createPasteController);

pasteRouter.get("/:id", getPasteController);

export default pasteRouter;
