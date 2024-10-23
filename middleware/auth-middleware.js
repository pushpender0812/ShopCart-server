const jwt = require("jsonwebtoken");
const User = require("../model/User");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");
  // console.log(token,"sddddddd................");
  const jwtToken = token.replace("Bearer", "").trim();
  if (!jwtToken) {
    return res.status(401).json({ message: "token not found" });
  }

  // console.log("Token from the middleware ", jwtToken);

  try {
    const isVerified = jwt.verify(jwtToken, process.env.SECRET_KEY);
    const userData = await User.findOne(
      { email: isVerified.email },
      { password: 0 }
    );
    // console.log(userData);
    if (userData.isblocked) {
      return res.status(400).json({ message: "you are blocked", block: true });
    }
    req.user = userData;
    req.token = token;
    req.userID = userData._id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "token not found" });
  }
};

module.exports = authMiddleware;
