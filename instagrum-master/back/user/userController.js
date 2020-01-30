const User = require("./userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config.js");
const fs = require('fs')

const register = (req, res) => {
  const host = req.hostname;
  let data = req.body;
  let user = new User();
    if (req.file!=undefined) {
        const filePath =
            req.protocol +
            "://" +
            host +
            ":" +
            req.socket.localPort +
            "/" +
            req.file.path;
            user.profilePicURL = filePath.replace(/\\/g, '/').toString('base64');
            console.log(user.profilePicURL)
    } else {
        user.profilePicURL = '';
    }
  user.username = data.username;
  user.password = data.password;
  console.log("user", user);

  user
    .save()
    .then(picSaved => {
      res.json(picSaved);
    })
    .catch(e => {
      res.status(400).json(e);
    });
};

const changeAvatar = (req, res) => {
  const host = req.hostname;
  let user = req.user;
  const filePath =
    req.protocol +
    "://" +
    host +
    ":" +
    req.socket.localPort +
    "/" +
    req.file.path;

  // let data = req.body;
  // let user = new User();
  let oldAvatarPath = user.profilePicURL
    .split(`${req.protocol + "://" + host + ":" + req.socket.localPort + "/"}`)
    .pop();
  fs.unlink(oldAvatarPath, err => {
    if (err) {
      console.error(err);
      return;
    }
  });
  user.profilePicURL = filePath;

  user
    .save()
    .then(picSaved => {
      res.json(picSaved);
    })
    .catch(e => {
      res.status(400).json(e);
    });
};

const login = async (req, res) => {
  try {
    let user = await User.findOne({
      username: req.body.username
    });
    if (!user) {
      res.status(400).json("no such user");
      return;
    }
    bcrypt.compare(req.body.password, user.password, (err, response) => {
      if (response) {
        let access = "auth";
        let token = jwt
          .sign(
            {
              _id: user._id.toHexString(),
              access
            },
            config.password
          )
          .toString();
        user.tokens.push({
          token,
          access
        });
        user.save().then(() => {
          res.header("x-auth", token).json(user);
        });
      } else {
        res.status(400).json("wrong password");
      }
    });
  } catch (e) {
    res.status(400).json(e);
  }
};

const changeUserInfo = async (req, res) => {
  let user = req.user;
  try {
    if (req.body.newUsername != undefined) {
      user.username = req.body.newUsername;
      user.save();
    }
    if (req.body.newPassword != undefined) {
      bcrypt.compare(req.body.currPassword, user.password, (err, response) => {
        console.log(err, response);

        if (response) {
          if (req.body.newPassword === req.body.repPassword) {
            user.password = req.body.newPassword;
            user.save();
          }
          res.status(200).json(response);
        } else {
          console.log("error");

          res.status(400).json("wrong password");
        }
      });
    }
    // res.status(200).json(response);
  } catch (e) {
    res.status(400).json(e);
  }
};

// const checkPsw = async (req, res) => {
//   let user = req.user;

//   try {
//     bcrypt.compare(req.body.currPassword, user.password, (err, response) => {
//       console.log(err, response);

//       if (response) {
//         if (req.body.newPassword === req.body.repPassword) {
//           user.password = req.body.newPassword;
//           user.save();
//         }
//         res.status(200).json(response);
//       } else {
//         console.log("error");

//         res.status(400).json("wrong password");
//       }
//     });
//   } catch (e) {
//     res.status(400).json(e);
//   }
// };

const getAll = async (req, res) => {
  try {
    let users = await User.find();
    res.json(users);
  } catch (e) {
    res.status(400).json(e);
  }
};

const getSingleUser = async (req, res) => {
  let id = req.params.id;
  try {
    let user = await User.findOne({
      _id: id
    });
    res.json(user);
  } catch (e) {
    res.status(400).json(e);
  }
};

const followUser = async (req, res) => {
    User.findById(req.params.id, async function(err, user) {
        
        let user2 = req.params.id;
        let id = req.user.id;
        let isAddedToFollowing = await User.findOne({
            _id: id,
            following: {
                _id: user2
            }
        })
        console.log(id)
        console.log(user2)
        console.log(isAddedToFollowing)

        if (!isAddedToFollowing) {
            user.followers.push(req.user._id);
            user.save(async function(err) {
            if(err) {
                console.log(err)
            }
            else {
                let thisUser = req.user
                thisUser.following.push(user._id)
                let response = await thisUser.save()
                res.json(response)
            }
        })
        console.log("ADDED")
        } else {
            user.followers.pull(req.user._id);
            user.save(async function(err) {
            if(err) {
                console.log(err)
            }
            else {
                let thisUser = req.user
                thisUser.following.pull(user._id)
                let response = await thisUser.save()
                res.json(response)
            }
        })
        console.log("REMOVED")
        }
    })
}

const deleteUserByName = async (req, res) => {
  let username = req.params.username;
  try {
    let user = await User.deleteOne({
      username: username
    });
    res.json(user);
  } catch (e) {
    res.status(400).json(e);
  }
};

const logout = (req, res) => {
  let token = req.token;
  let user = req.user;
  user
    .update({
      $pull: {
        tokens: {
          token
        }
      }
    })
    .then(() => {
      res.json("logged out");
    })
    .catch(e => res.status(400).json(e));
};

module.exports = {
    register,
    getAll,
    getSingleUser,
    deleteUserByName,
    login,
    logout,
    followUser,
    // checkPsw,
    changeUserInfo,
    changeAvatar
};