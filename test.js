/**Ryan Endpoints for Login*/
/**
 * @swagger
 * /users/search/{username}/:
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
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success. users with the specified last name have been retrieved.
 *       404:
 *         description: Error. No users found with the requested last name.
 */
app.get('/users/search/:username', function (req, res) {
    var username = req.params.username;
    var pword = req.query.password;
    console.log(username,pword)
  
    glob("users/*.json", null, function (err, files) {
      if (err) {
        return res.status(500).send({ "message": "error - internal server error" });
      }
      if(searchforUser(username) == false){
        return res.status(404).send({ "message": "No users found with the specified username." });
      }
  
      else{
        // var obj = {};
        
        var currentuser = searchforUser(username)
        console.log("Found",currentuser)
        var str = JSON.stringify(currentuser, null, 2);
  
       
        console.log(username, pword,currentuser.password)
        if(pword != currentuser.password){
          var rsp_obj = {};
          rsp_obj.record_id = -1;
          rsp_obj.message = 'Incorrect Password. Try Again';
          return res.status(200).send(rsp_obj);
        }else{
          fs.writeFile("currentuser/" + currentuser.username + ".json", str, function (err) {//writes to the users directory
        
            var rsp_obj = {};
            if (err) {
              rsp_obj.record_id = -1;
              rsp_obj.message = 'error - unable to create resource';
              return res.status(200).send(rsp_obj);
            } else {
              console.log("Success",currentuser)
              rsp_obj.message = 'Greetings New User:'+currentuser.username+"!";
              return res.status(200).send(currentuser);
            }
          }) 
        }
  
      
        
        
      }
      
    });
  });
  