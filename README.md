Server url: https://peaceful-taiga-88033.herokuapp.com

GET /users (lat, lng, r) - get all users within range  
POST /login (lat, lng) - add current user to db and get his id  
GET /users/:id - get user with id  
POST /users/:id (lat, lng) - update user with id  
DELETE /users - remove all users  
DELETE /users/:id - remove user with id  
GET /parkings - get payable parkings (parkirisca)