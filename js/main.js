init();
var clientID = "26d997213b38471bbfc418bab493b6a3";
var redirect_uri = "http://www.vacom.me/goodbye";
var url = "https://www.instagram.com/oauth/authorize/?client_id="+clientID+"&redirect_uri="+redirect_uri+"&response_type=token&scope=follower_list+relationships";

function init(){
    if(isAuthenticated()){
        initApp();
    }else{
        if(window.location.hash) {
            var hash = window.location.hash;
            var getToken = hash.split("=");
            console.log(getToken[1]);
            localStorage.setItem("iToken", getToken[1]);
            window.history.back();
        }else{
            initWelcome();             
        }
    }
}

/*****
 * EVENTS
 */

//User login to get token acess
$(document).on("click", "#btlogin", function(){
     var token = window.open(url, "_self");
});

//User logout remove acess token
$(document).on("click", "#btLogout", function(){
    localStorage.removeItem("iToken");
    initWelcome();
});

//User login to get token acess
$(document).on("click", ".btUnfollowUser", function(){
     var id = this.id;
     var unfollow = unFollowUser(id);
        if(unfollow == "none"){
            $("#"+id).parent().parent().hide('slow', function(){ 
                this.remove(); 
                var checkTableRows =  $("#resultsTable").find("tbody").html();
                    if(checkTableRows == ""){
                        $("#app").html(emptyTableTemplate());
                    }
            });       
        }else{
            swal('Oops...', 'Something went wrong! Try Again', 'error');
        }
});

/*****
 * VERIFICATIONS
 */

//check if user is login in
function isAuthenticated(){
    if (typeof(Storage) !== "undefined") {
            token = localStorage.getItem("iToken");
                if(token == null){
                    return false;
                }else{
                    return true;
                }
    } else {
        swal('Oops...', 'Sorry! No Web Storage support...Try another browser', 'error');
    }
}

/*****
 * SCEENS
 */

function initWelcome(){
    $("#resultsTable").hide();
    $(".list-menu").hide();
    $("#btlogin").show();
    $("#app").html(welcomeTemplate()); 
}

function initApp(){
    $("#welcome").hide();
    $("#resultsTable").show();
    getProfile();
    createList();
}

/*****
 * SUBSCRIPTIONS
 */

//comparars de followers and creates the list
function createList(){
    var listFollowedBy = getFollowedBy();
    var listFollows = getFollows();
    var result = "";
        for(var i = 0; i < listFollowedBy.length; i++){
             for(var j = 0; j < listFollows.length; j++){
                 if(listFollows[j].id != listFollowedBy[i].id){
                    result += tableListTemplate(listFollows[i].id, listFollows[i].full_name, listFollows[i].profile_picture, "No");   
                 }
             }
         }
    if(result != ""){
         $("#resultsTable").find("tbody").html(result);
    }else{
         $("#app").html(emptyTableTemplate());
    }     
}

//get user information
function getProfile(){
    var token = localStorage.getItem("iToken");
    $.ajax({
        method: "GET",
        url: "https://api.instagram.com/v1/users/self/?access_token="+token,
    }).done(function(res) {
        $("#countFollowed_by").html(res.data.counts.followed_by);
        $("#countFollows").html(res.data.counts.follows);
        $("#userFull_name").html(res.data.full_name);
    });
}

//follows of the user
function getFollows(){
     var token = localStorage.getItem("iToken");
     var data;
        $.ajax({
            method: "GET",
            url: "https://api.instagram.com/v1/users/self/follows?access_token="+token,
              async: false
        }).done(function(res) {
            data = res.data;
        });
    return data;
}

//followers of the user
function getFollowedBy(){
    var token = localStorage.getItem("iToken");
    var data;
        $.ajax({
            method: "GET",
            url: "https://api.instagram.com/v1/users/self/followed-by?access_token="+token,
            async: false
        }).done(function(res) {
        //  console.log(data);
            data = res.data;
        });
    return data;
}

//Unfolows a specific user
function unFollowUser(id){
     var token = localStorage.getItem("iToken");
     var data;
        $.ajax({
            method: "POST",
            url: "https://api.instagram.com/v1/users/"+id+"/relationship?access_token="+token,
            data: { action: "unfollow"},
            async: false
        }).done(function(res) {
            data = res.data.outgoing_status;
        });
    return data;
}

/*****
 * TEMPLATEs
 */
//UI for the list of the users that do not follow the user
function tableListTemplate(id, full_name, profile_picture, following){
    var template = '<tr class="animated fadeInUp"><td><img src="'+profile_picture+'" alt="profile"></td>'+
                    '<td>Flavio Amaral</td><td>'+following+'</td><td><button id="'+id+'" class="button btUnfollowUser" >Goodbye</button></td> </tr>';
    return template;                
}

//This template is true when is nothing in the table
function emptyTableTemplate(){
    var template = '<div id="Goodbye" class="animated fadeInUp">'+
                        '<h4>It was a big list but had to be...</h4>'+  
                        '<p>I can finally be happy and move forward. <br> Goodbye those who do not follow me back.</p>'+
                        '<i class="fa fa-smile-o" aria-hidden="true"></i>'+
                    '</div>';
    return template;                
}

//Template for welcome page
function welcomeTemplate(){
    var template = '<div id="welcome" class="animated fadeInUp">'+
                        '<h4>I tried...</h4>'+  
                        '<p>I tried, I waited but received no reply so its time to say goodbye.'+ 
                        '<br>Login to display the list of all those people who do not follow you back.</p>'+
                        '<i class="fa fa-frown-o" aria-hidden="true"></i>'+
                   '</div>';
    return template;
}







