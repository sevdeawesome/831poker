

//On connection, local storage will be checked to see if the lobby and username of the player is valid. If so, it will emit them to the server and correctly be put in the right game.


if(localStorage.getItem('lobby') != null && localStorage.getItem('name') != null )
{
    sock.emit('test', localStorage.getItem('name') + " joining lobby: " + localStorage.getItem('lobby'));

    //lobby, name, stacksize sent to server
    var newLobby =(localStorage.getItem('lobby'));
    var newName = (localStorage.getItem('name'));
    var newStack = (localStorage.getItem('stacksize'));

    console.log(newLobby);
    console.log(newName);
    console.log(newStack);

    var sendArr = []; sendArr.push(newLobby); sendArr.push(newName); sendArr.push(newStack);
    sock.emit('joinRoom', sendArr);

    sock.emit('test', "From Console: " + newName + " successfully joined the lobby: " + newLobby);
}
