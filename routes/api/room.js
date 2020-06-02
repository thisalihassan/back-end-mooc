const users = [];
const addUser = ({ id, name, myroom, check }) => {
  let room = myroom;
  if (!check) {
    room = myroom[0] + "" + myroom[1];
  }

  const existingUser = users.find(
    (user) => user.room === room && user.id === id
  );
  if (!id || !room) return { error: "Username and room are required." };
  if (existingUser) {
    console.log("not added");
    return { user: existingUser };
  }

  const user = { id, name, room };
  users.push(user);

  return { user };
};

const removeUser = (myroom, id) => {
  const index = users.findIndex(
    (user) => user.room === myroom && user.id === id
  );

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (myroom, id) =>
  users.find((user) => user.room === myroom && user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room == room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
