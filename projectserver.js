//Projectserver is the main server of the Re-FIND project

//Information that allows our server to run. Do NOT change these 
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');
const glob = require("glob");
const { type } = require('os');
//const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Group 2: RecyclingPlant Finder API',
      version: '1.0.0'
    }
  },
  apis: ['projectserver.js']

};

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('./public'));





/**Ryan Endpoints: This one works for the signup page and creates a user */
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Creates a new User object with all of its attributes.
 *     description: Use this endpoint to create a new User.
 *     parameters:
 *       - name: first_name
 *         description: User's First Name
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: last_name
 *         description: User's Last Name
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: email
 *         description: User's Email
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: username
 *         description: User's Username
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *       - name: password
 *         description: Password
 *         in: formData
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       404:
 *         description: Unable to create resource.
 *       201:
 *         description: Success. The user object has been created.
 *       
 */
app.post('/users', function (req, res) {
  //Creates a record ID for the user
  var record_id = new Date().getTime();

  //Create the user object. They have a username, ID, name, username, password, age, and a default point number
  var user = {};
  user.record_id = record_id;
  user.first_name = req.body.first_name;
  user.last_name = req.body.last_name;
  user.email = req.body.email;
  user.username = req.body.username;
  user.password = req.body.password;
  //user.age = req.body.age;
  user.point_num = 0;
  console.log(user)

  //Convert the user to a string
  var str = JSON.stringify(user, null, 2);
  const fs = require('fs');

  //Search through directory users
  const dir = 'users';

  //Either create the users folder, or confirm it's existence
  fs.access(dir, (err) => {
    if (err) {
      fs.mkdir(dir, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Directory created successfully!');
        }
      });
    } else {
      console.log('Directory already exists!');
    }
    //Check if the user exists. If they do, then stop them from making a user with that account
    if (!checkUserExists(user.username)) {
      fs.writeFile("users/" + record_id + ".json", str, function (err) {//Write info to the users directory
        console.log(str)
        var rsp_obj = {};
        if (err) {
          rsp_obj.message = 'error - unable to create resource';
          rsp_obj.record_id = -1;
          return res.status(404).send(rsp_obj);
        } else {
          rsp_obj.record_id = record_id;
          rsp_obj.message = 'Greetings New User:' + user.username + '!';
    
          // Write to the current user file
          fs.writeFile("currentuser/" + user.username + ".json", str, function (err) {
            if (err) {
              rsp_obj.record_id = -1;
              rsp_obj.message = 'error - unable to create resource';
            }
            res.status(201).send(rsp_obj);
          });
        }
      }) //end writeFile method
    } else {
      console.log("user exists")
      var rsp_obj = {};
      rsp_obj.record_id = -1;
      rsp_obj.message = 'Username taken. Please try again.';
      return res.status(404).send(rsp_obj);
    }
  });


}); //end post method

/**Ryan Endpoints */
/**
 * @swagger
 * /users/{recordid}:
 *   get:
 *     summary: Get a User by record ID.
 *     description: Use this endpoint to retrieve a user based on their record ID.
 *     parameters:
 *       - name: recordid
 *         description: User's record ID
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. The user object has been retrieved.
 *       404:
 *         description: Error. The requested resource was not found.
 */


app.get('/users/:record_id', function (req, res) {
  var record_id = req.params.record_id;

  fs.readFile("users/" + record_id + ".json", "utf8", function (err, data) {
    if (err) {
      var rsp_obj = {};
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    } else {
      const obj = JSON.parse(data)
      console.log(typeof(data))
      return res.status(200).send(data);
    }
  });
});

function readFiles(files, arr, res) {
  fname = files.pop();
  if (!fname)
    return;
  fs.readFile(fname, "utf8", function (err, data) {
    if (err) {
      return res.status(500).send({ "message": "error - internal server error" });
    } else {
      arr.push(JSON.parse(data));
      if (files.length == 0) {
        var obj = {};
        obj.users = arr;
        console.log("The user's object after reading the files",obj.users);
        return res.status(200).send(obj);
      } else {
        readFiles(files, arr, res);
      }
    }
  });
}

/**Ryan Endpoints: This endpoint is for the leaderboard. *Note, Please ask Carolina to help fix this one by sorting by Pointnumber* */
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get an array of all users sorted from highest too lowest point num
 *     description: Use this endpoint to retrieve an array of all users.
 *     responses:
 *       200:
 *         description: Success. An array of users has been retrieved.
 *       500:
 *         description: Error. Internal server error occurred.
 */
app.get('/users', function (req, res) {
  console.log("get users lol")
  var obj = {};
  var arr = [];
  filesread = 0;

  glob("users/*.json", null, function (err, files) {
    if (err) {
      return res.status(500).send({ "message": "error - internal server error" });
    }
    readFiles(files, [], res);
    /*files.forEach(function (file) {
      var userData = fs.readFileSync(file, "utf8");
      var user = JSON.parse(userData);
     // if (student.last_name === searchLastName) {
        arr.push(user);
      //}
    });
    const objArr = JSON.parse(arr);*/
  //  console.log(objArr);
  });

});

/**Ryan/Carolina Endpoint: Gets user by record id and allows them to update all or only some of their information*/
/**
 * @swagger
 * /users/{record_id}:
 *   put:
 *     summary: Update an existing user by record ID.
 *     description: Use this endpoint to update an existing student based on their record ID.
 *     parameters:
 *       - name: record_id
 *         description: users record id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: first_name
 *         description: users first name
 *         in: formData
 *         required: false
 *         schema:
 *           type: string
 *       - name: last_name
 *         description: users last name
 *         in: formData
 *         required: false
 *         schema:
 *           type: string
 *       - name: email
 *         description: user email
 *         in: formData
 *         required: false
 *         schema:
 *           type: string
 *       - name: username
 *         description: username
 *         in: formData
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Error. Unable to update resource.
 *       201:
 *         description: Success. The student has been updated.
 *       404:
 *         description: Error. The requested resource was not found.
 */
app.put('/users/:record_id', function (req, res) {
  var record_id = req.params.record_id;
  var fname = "users/" + record_id + ".json";
  var rsp_obj = {};
  var obj = {};

// Read existing JSON file
fs.readFile(fname, 'utf8', function (err, data) {
  if (err) {
    rsp_obj.record_id = record_id;
    rsp_obj.message = 'error - resource not found';
    return res.status(404).send(rsp_obj);
  }

  const existingObj = JSON.parse(data);

  // Update only specified properties
  obj.record_id = record_id;
  obj.first_name = req.body.first_name || existingObj.first_name;
  obj.last_name = req.body.last_name || existingObj.last_name;
  obj.email = req.body.email || existingObj.email;
  obj.username = req.body.username || existingObj.username;
  obj.password = existingObj.password;
  obj.point_num = existingObj.point_num;

  var str = JSON.stringify(obj, null, 2);

  //check if file exists
  fs.stat(fname, function (err) {
    if (err == null) {
      //file exists
      fs.writeFile("users/" + record_id + ".json", str, function (err) {
        var rsp_obj = {};
        if (err) {
          rsp_obj.record_id = record_id;
          rsp_obj.message = 'error - unable to update resource';
          return res.status(200).send(rsp_obj);
        } 
          // Update points in currentuser folder
        fs.writeFile(`currentuser/${existingObj.username}.json`, str, function (err) {
          if (err) {
            const rsp_obj = {
              message: 'error - unable to update points in currentuser folder',
            };
            return res.status(500).send(rsp_obj);
          }

          const rsp_obj = {
            message: 'Success. User\'s points have been incremented.',
          };
          return res.status(200).send(rsp_obj);
        });
        // else {
        //   rsp_obj.record_id = record_id;
        //   rsp_obj.message = 'successfully updated';
        //   return res.status(201).send(rsp_obj);
        // }
      });

    } else {
      rsp_obj.record_id = record_id; const fs = require('fs');
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    }
  });
  });

}); //end put method

/**Ryan Endpoints: Deletes a user by record ID. Could prove useful in the delete button on Profile screen */
/**
 * @swagger
 * /users/{record_id} :
 *  delete:
 *    summary: Delete an existing user by obtaining their record ID
 *    description: Deletes from the user directory by their record ID.
 *    parameters:
 *    - name: record_id
 *      description: user's Record ID
 *      in: path
 *      required: true
 *      schema:
 *        type: string
 *    responses:
 *      200:
 *        description: record deleted
 *      404:
 *        description: error - resource not found
 */
app.delete('/users/:record_id', function (req, res) {
  var record_id = req.params.record_id;
  var fname = "users/" + record_id + ".json";
 
// Update points in currentuser folder
  
  fs.unlink(fname, function (err) {
    var rsp_obj = {};
    if (err) {
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    } else {
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'Success. Goodbye!';
     /*fs.unlink(current, function (err) {
        var rsp_obj = {};
        if (err) {
          rsp_obj.record_id = record_id;
          rsp_obj.message = 'error - resource not found';
          return res.status(404).send(rsp_obj);
        } else {
          rsp_obj.record_id = record_id;
          rsp_obj.message = 'Success. Goodbye!';
          return res.status(200).send(rsp_obj);
        }
      });*/
      return res.status(200).send(rsp_obj);
    }
  });

  
}); //end delete method


//Check if a user exists by their username. Update to include password as a parameter?
function checkUserExists(username) {
  const files = glob.sync("users/*.json");
  const listOfusers = [];
  
  for (const fname of files) {
    const data = fs.readFileSync(fname, "utf8");
    const user = JSON.parse(data);
    listOfusers.push(user);

    if (user.username == username) {
      console.log(user.username == username)
      return true;
    }
  }

  return false;
}

//Search for a user by a username. Update to include password as a parameter?
function searchforUser(username, res) {
  const files = glob.sync("users/*.json");
  const listOfusers = [];
  
  for (const fname of files) {
    const data = fs.readFileSync(fname, "utf8");
    const user = JSON.parse(data);
    listOfusers.push(user);

    if (user.username == username) {
      return user;
      
    }
  }

  return false;
}

//Search by email
function searchforEmail(email, res) {
  const files = glob.sync("users/*.json");
  const listOfusers = [];
  
  for (const fname of files) {
    const data = fs.readFileSync(fname, "utf8");
    const user = JSON.parse(data);
    listOfusers.push(user);

    if (user.email == email) {
      console.log("Found user",user)
      return user;
      
    }
  }

  return false;
}

/**Ryan Endpoints for Login*/
/**
 * @swagger
 * /users/search/{username}/{password}:
 *   get:
 *     summary: Get User Info by Username
 *     description: Use this endpoint to get a user's information by Username
 *     parameters:
 *       - name: username
 *         description: user's user name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: password
 *         description: user's password
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. User with the specified username and password found.
 *       401:
 *         description: Unauthorized. Incorrect username or password.
 *       404:
 *         description: Not Found. No user found with the specified username.
 */

app.get('/users/search/:username/:password', function (req, res) {
  var username = req.params.username;
  var password = req.params.password;
  console.log(username, password);

  glob("users/*.json", null, function (err, files) {
    if (err) {
      return res.status(500).send({ "message": "error - internal server error" });
    }

    var currentuser = searchforUser(username);

    if (!currentuser) {
      return res.status(404).send({ "message": "No user found with the specified username." });

    }

    console.log("Found", currentuser);

    if (password !== currentuser.password) {
      return res.status(401).send({ "message": "Incorrect username or password." });
    }


    var str = JSON.stringify(currentuser, null, 2);

    fs.writeFile("currentuser/" + currentuser.username + ".json", str, function (err) {
      if (err) {
        return res.status(500).send({ "message": "error - unable to create resource" });
      } else {
        var rsp_obj = {};
        console.log("Success", currentuser);
        rsp_obj.message = 'Greetings New User:'+currentuser.username+"!";
        return res.status(200).send(currentuser);
        
      }
    });
  });
});


//Logout

function readCurrentFiles(files, arr, res) {
  fname = files.pop();
  if (!fname)
    return;
  fs.readFile(fname, "utf8", function (err, data) {
    if (err) {
      return res.status(500).send({ "message": "error - internal server error" });
    } else {
      arr.push(JSON.parse(data));
      if (files.length == 0) {
        var obj = {};
        obj.users = arr;
        // console.log("The user's object after reading the files",obj.users);
        return res.status(200).send(obj.users);
      } else {
        readCurrentFiles(files, arr, res);
      }
    }
  });
}







/**Ryan Endpoints for Logout: Deletes the current user*/
/**
 * @swagger
 * /currentuser/delete-all:
 *   delete:
 *     summary: Delete all user files in the currentuser folder
 *     description: Deletes all files from the user directory.
 *     responses:
 *       200:
 *         description: records deleted
 *       404:
 *         description: error - resource not found
 */
app.delete('/currentuser/delete-all', function (req, res) {
  var folderPath = "currentuser/";

  fs.readdir(folderPath, function (err, files) {
    if (err) {
      var rsp_obj = {
        message: 'error - internal server error'
      };
      return res.status(500).send(rsp_obj);
    }

    // Check if any files exist
    if (files.length === 0) {
      var rsp_obj = {
        message: 'error - resource not found'
      };
      return res.status(404).send(rsp_obj);
    }

    // Iterate through the files and delete them
    files.forEach(file => {
      var filePath = folderPath + file;

      fs.unlink(filePath, function (err) {
        if (err) {
          console.error(err);
        }
      });
    });

    var rsp_obj = {
      message: 'Success. Goodbye!'
    };

    return res.status(200).send(rsp_obj);
  });
});


//Get info of the current user

/**Ryan Endpoints */
/**
 * @swagger
 * /users/{recordid}:
 *   get:
 *     summary: Get a User by record ID.
 *     description: Use this endpoint to retrieve a user based on their record ID.
 *     parameters:
 *       - name: recordid
 *         description: User's record ID
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. The user object has been retrieved.
 *       404:
 *         description: Error. The requested resource was not found.
 */


app.get('/users/:record_id', function (req, res) {
  var record_id = req.params.record_id;

  fs.readFile("users/" + record_id + ".json", "utf8", function (err, data) {
    if (err) {
      var rsp_obj = {};
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    } else {
      const obj = JSON.parse(data)
      console.log(typeof(data))
      return res.status(200).send(data);
    }
  });
});



const path = require('path');
//Ryan Endpoint: Obtain the current user
/** 
 * @swagger
 * /currentuser/last:
 *   get:
 *     summary: Get the last user file.
 *     description: Retrieve the contents of the last user file in the currentuser folder.
 *     responses:
 *       200:
 *         description: Success. The last user file has been retrieved.
 *       404:
 *         description: Error. No user files found in the currentuser folder.
 */
app.get('/currentuser/last', function (req, res) {
  const folderPath = 'currentuser/';

  fs.readdir(folderPath, function (err, files) {
    if (err) {
      const rsp_obj = {
        message: 'error - internal server error'
      };
      return res.status(500).send(rsp_obj);
    }

    if (files.length === 0) {
      const rsp_obj = {
        message: 'error - resource not found'
      };
      return res.status(404).send(rsp_obj);
    }

    const lastFileName = files[files.length - 1];
    const filePath = path.join(folderPath, lastFileName);

    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) {
        const rsp_obj = {
          message: 'error - internal server error'
        };
        return res.status(500).send(rsp_obj);
      }

      try {
        const lastUser = JSON.parse(data);
        console.log(lastUser);
        return res.status(200).send(lastUser);
      } catch (error) {
        const rsp_obj = {
          message: 'error - failed to parse JSON file'
        };
        return res.status(500).send(rsp_obj);
      }
    });
  });
});


// ... (previous code)

/**
 * @swagger
 * /users/increment-points/{username}:
 *   put:
 *     summary: Increment the point_num variable of a user by 1.
 *     description: Use this endpoint to increment the point_num variable of a user by 1.
 *     parameters:
 *       - name: username
 *         description: User's username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. User's points have been incremented.
 *       404:
 *         description: Error. User not found.
 */
app.put('/users/increment-points/:username', function (req, res) {
  const username = req.params.username;

  // Function to increment points in both users and currentuser folders
  function incrementPoints(user) {
    user.point_num += 1;

    const str = JSON.stringify(user, null, 2);

    // Update points in users folder
    fs.writeFile(`users/${user.record_id}.json`, str, function (err) {
      if (err) {
        const rsp_obj = {
          message: 'error - unable to update points in users folder',
        };
        return res.status(500).send(rsp_obj);
      }

      // Update points in currentuser folder
      fs.writeFile(`currentuser/${user.username}.json`, str, function (err) {
        if (err) {
          const rsp_obj = {
            message: 'error - unable to update points in currentuser folder',
          };
          return res.status(500).send(rsp_obj);
        }

        const rsp_obj = {
          message: 'Success. User\'s points have been incremented.',
        };
        return res.status(200).send(rsp_obj);
      });
    });
  }

  // Search for the user by username
  const user = searchforUser(username);

  if (!user) {
    const rsp_obj = {
      message: 'error - user not found',
    };
    return res.status(404).send(rsp_obj);
  }

  incrementPoints(user);
});

// ... (remaining code)


function readFiles(files, arr, res) {
  fname = files.pop();
  if (!fname)
    return;
  fs.readFile(fname, "utf8", function (err, data) {
    if (err) {
      return res.status(500).send({ "message": "error - internal server error" });
    } else {
      arr.push(JSON.parse(data));
      if (files.length == 0) {
        var obj = {};
        obj.users = arr;
        return res.status(200).send(obj);
      } else {
        readFiles(files, arr, res);
      }
    }
  });
}

function readFiles2(files, arr, res) {
  fname = files.pop();
  if (!fname)
    return;
  fs.readFile(fname, "utf8", function (err, data) {
    if (err) {
      return res.status(500).send({ "message": "error - internal server error" });
    } else {
      arr.push(JSON.parse(data));
      if (files.length == 0) {
        var obj = {};
        obj.users = arr;
        return res.status(200).send(obj);
      } else {
        readFiles(files, arr, res);
      }
    }
  });
}
//Create an endpoint that deletes the users files and the currentuser file at the same time.

//Check all endpoints, and find ways to place the information from the current user file into the current data variable


//Updated server port
const PORT = process.env.PORT || 1007;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
    console.log(`Webapp:   http://localhost:${PORT}/`);
    console.log(`API Docs: http://localhost:${PORT}/api-docs`);
});