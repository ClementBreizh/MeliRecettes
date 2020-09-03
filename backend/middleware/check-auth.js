const jwt = require("jsonwebtoken");

module.exports= (req, resp, next) => {
  try{
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "secret_dev_hashcode_longer_than_expected");
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  } catch (error) {
    resp.status(401).json({
      message: "Auth failed"
    })
  }

};
