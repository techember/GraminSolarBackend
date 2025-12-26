import { Router } from "express";
import {
  /*signup,*/ logout,
  login,
  getAllUsers,
  getAllVendors,
  getUsersByVendor,
  updateOrderStatus,
  updateVendorStatus,
  updateVendorCommission,
} from "../controllers/adminController";

const adminRouter = Router();

// adminRouter.post("/signup", signup);
adminRouter.post("/login", login);
adminRouter.post("/logout", logout);
adminRouter.get("/getalluser", getAllUsers);
adminRouter.get("/getallvendors", getAllVendors);
adminRouter.get("/vendor/:vendorId/users", getUsersByVendor);
adminRouter.put("/orders/:orderId/status", updateOrderStatus);
adminRouter.put("/vendor/:vendorId/status", updateVendorStatus);
adminRouter.put("/vendor/:vendorId/commission", updateVendorCommission);

export default adminRouter;
