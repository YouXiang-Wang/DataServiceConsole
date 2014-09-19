require(CORE + "base_model.js");

function UserModel(){
    this.getUserById = function(uid, callBack){
        console.log(uid);
        console.log(typeof uid);
        var whereArea = "f_uid = " + uid,
            result = this.query(whereArea, false,function(result){callBack(result);});
        return result;
    };
    /*
     * identify if the user logon or not
     */
    this.checkUser = function(username, password, callBack){
        var whereArea = "f_uname = '" + username + "' and f_password = '" + password + "'",
            result = this.query(whereArea, false,function(result){callBack(result);});
        return result;
    };

    /*
     *Add a new user
     */
    this.addNewUser = function(userParameters, callBack){
        var result = this.add(userParameters,function(result){callBack(result);});
        return result;
    };

    /*
     * Update the user
     */
    this.updateUser = function(uid, userParameters, callBack){
        var result = this.update(uid,userParameters, function(result){callBack(result);});
        return result;
    };

    /*
     * Delete the user
     */
    this.deleteUser = function(uid, callBack){
        var result = this.deleteItem(uid, function(result){callBack(result);});
        return result;
    };

    /*
     * Query the users
     */
    this.searchUser = function(userName, callBack){
        var whereArea = "f_uname = '" + username + "'",
            result = this.query(whereArea, false, function(result){callBack(result);});
        return result;
    };

}
UserModel.prototype = new BaseModel("t_user");
global.UserModel = UserModel;