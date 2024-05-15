const { Room, User } = require("../models/index");
const generateID = () => Math.random().toString(36).substring(2, 10);
// create room
const createRoom = async (name, users, updateAt) => {
  try {
    const roomId = generateID();
    if (users.length < 3) {
      throw new Error("At least 3 users required to create a room.");
    }
    for (const user of users) {
      const existingUser = await User.findOne({ phoneNumber: user });
      if (!existingUser) {
        throw new Error(`User with phone number ${user} does not exist.`);
      }
    }
    const owner = users[0]; // Lãnh đạo là người đầu tiên trong mảng
    const members = users.slice(1); // Các thành viên là các người còn lại trong mảng
    return await Room.create({
      users,
      roomId,
      name,
      roles: {
        owner,
        members,
      },
      createAt: Date.now(),
      updateAt,
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
// findRoomByPhoneNumber
const findRoomByPhoneNumber = async (phoneNumber) => {
  console.log("36: " + phoneNumber);
  try {
    // const room = await Room.findOne({ phoneNumber });
    const room = await Room.findOne({ users: { $in: 5 }  });
    if (!room) {
      throw new Error("Room is not exist!");
    }
    // console.log("42: " + room);
    return room;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
// findRoomByManyPhoneNumber
const findRoomByManyPhoneNumber = async (users) => {
  try {
    const room = await Room.findOne({ users: { $all: users } });
    if (!room) {
      throw new Error("Room is not exist!");
    }
    return room;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
// findRoomByRoomId
const findRoomByRoomId = async (roomId) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error("Room is not exist!");
    }
    return room;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
// delete room by id
const deleteRoomByRoomId = async (roomId) => {
  try {
    const room = await Room.findOneAndDelete({ roomId });
    if (!room) {
      throw new Error("Room is not exist!");
    }
    return room;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
// join room by roomId
const joinRoomByRoomId = async (roomId, phoneNumber) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error("Room is not exist!");
    }
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new Error("User is not exist!");
    }
    // kiểm tra xem người dùng đã tham gia vào phòng hay chưa
    if (room.users.includes(phoneNumber)) {
      throw new Error("User has joined this room!");
    }
    room.users.push(phoneNumber);
    user.rooms.push(roomId);
    
    // Thêm người dùng vào danh sách thành viên của phòng
    room.roles.members.push(phoneNumber);
    await room.save();
    await user.save();
    return room
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
// authorization room
const authorizationRoomOwner = async (roomId, phoneNumber) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error("Room is not exists!");
    }
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new Error("User is not exist!");
    }
    // Xóa người dùng khỏi danh sách leader và member
    room.roles.leader = room.roles.leader.filter(leader => leader !== user.phoneNumber);
    room.roles.members = room.roles.members.filter(member => member !== user.phoneNumber);
    // Cập nhật trường owner
    room.roles.owner = user.phoneNumber;
    return await room.save();
  } catch (error) {
    console.log(error);
    throw error; // Throw lỗi ra bên ngoài hàm
  }
};
// update infor room
const updateInforRoom = async (roomId, newData) => {
  try {
    const { name, updateAt } = newData;
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error("Room is not exist!");
    }
    if (!name && !updateAt) {
      throw new Error("Missing room identification information!");
    }
    await Room.findOneAndUpdate({ roomId }, newData, { new: true });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
// authorization room leader
const authorizationRoomLeader = async (phoneAuth, roomId, phoneNumber) => {
  try {
    // Tìm kiếm thông tin phòng
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error("Room is not exist!");
    }
    
    // Kiểm tra xem người dùng phoneAuth có phải là owner của phòng hay không
    if (room.roles.owner !== phoneAuth) {
      throw new Error("You are not authorized to perform this action!");
    }

    // Tìm kiếm thông tin người dùng
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new Error("User is not exist!");
    }

    // Kiểm tra xem người dùng đã là leader của phòng hay không
    const isLeader = room.roles.leader.includes(user.phoneNumber);
    if (!isLeader) {
      // Nếu người dùng chưa là leader, thực hiện thêm vào
      // Loại bỏ người dùng ra khỏi danh sách thành viên
      room.roles.members = room.roles.members.filter(member => member !== user.phoneNumber);
      // Thêm người dùng vào danh sách leader
      room.roles.leader.push(user.phoneNumber);
      // Lưu lại thông tin phòng
      return await room.save();
    } else {
      throw new Error("User is already a leader!");
    }
  } catch (error) {
    console.log(error);
    throw error; // Throw lỗi ra bên ngoài hàm
  }
};
// authorization room members
const authorizationRoomMembers = async (roomId, phoneNumber) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error("Room is not exist!");
    }
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new Error("User is not exist!");
    }
    room.roles.members.push(user.phoneNumber);
    room.save();
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
// remove member out group
const removeMemberOutGroup = async (roomId, phoneNumber) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error("Room is not exist!");
    }
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new Error("User is not exist!");
    }
    if (room.roles.leader === phoneNumber) {
      throw new Error("Cannot remove leader out group");
    }
    if (room.roles.elders.includes(phoneNumber)) {
      throw new Error("Cannot remove leader out group");
    }
    if (room.users.includes(phoneNumber)) {
      // Kiểm tra nếu số điện thoại cần xóa không phải là elder và leader
      if (room.roles.leader !== phoneNumber) {
        room.users.pull(user.phoneNumber);
        room.roles.members.pull(user.phoneNumber);
        await room.save();
        user.rooms.pull(room.roomId);
        await user.save();
      } else {
        throw new Error("Cannot remove leader out group");
      }
    } else {
      throw new Error("This phone number is not a member of the group");
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
// remove elder out group
const removeElderOutGroup = async (roomId, phoneNumber) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error("Room is not exist!");
    }
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new Error("User is not exist!");
    }
    if (room.leader === phoneNumber) {
      throw new Error("Cannot remove leader out group");
    }
    if (room.users.includes(phoneNumber)) {
      // Kiểm tra nếu số điện thoại cần xóa không phải là người lãnh đạo
      if (room.roles.leader !== phoneNumber) {
        room.users.pull(user.phoneNumber);
        room.roles.members.pull(user.phoneNumber);
        await room.save();
        user.rooms.pull(room.roomId);
        await user.save();
      } else {
        throw new Error("Cannot remove leader out group");
      }
    } else {
      throw new Error("This phone number is not a member of the group");
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
// remove leader
// const removeLeaderOutGroup = async (roomId, phoneNumber) => {
//   try {
//     const room = await Room.findOne({ roomId });
//     if (!room) {
//       throw new Error("Room is not exist!");
//     }

//     // Kiểm tra nếu người rời là lãnh đạo
//     if (room.roles.leader === phoneNumber) {
//       // Nếu có người lãnh đạo phụ, chọn người lãnh đạo phụ đầu tiên làm lãnh đạo mới
//       if (room.roles.elders.length > 0) {
//         const newLeader = room.roles.elders[0];
//         room.roles.leader = newLeader;
//         room.roles.elders = room.roles.elders.filter(
//           (elder) => elder !== newLeader
//         ); // Loại bỏ người lãnh đạo mới khỏi danh sách lãnh đạo phụ
//       } else if (room.roles.members.length > 0) {
//         // Nếu không có người lãnh đạo phụ, chọn người tham gia đầu tiên làm lãnh đạo mới
//         const newLeader = room.roles.members[0];
//         room.roles.leader = newLeader;
//         room.roles.members = room.roles.members.filter(
//           (member) => member !== newLeader
//         ); // Loại bỏ người lãnh đạo mới khỏi danh sách thành viên
//       } else {
//         // Nếu không có thành viên nào trong nhóm, xóa luôn vai trò lãnh đạo
//         delete room.roles.leader;
//       }

//       // Xóa người lãnh đạo khỏi danh sách người tham gia của nhóm
//       room.users = room.users.filter((user) => user !== phoneNumber);

//       await room.save();
//     }
//   } catch (error) {
//     console.error(error);
//     throw new Error(error);
//   }
// };
const removeLeaderOutGroup = async (roomId, phoneNumber) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error("Room is not exist!");
    }

    // Kiểm tra nếu người rời là lãnh đạo
    if (room.roles.leader === phoneNumber) {
      // Nếu có người lãnh đạo phụ, chọn người lãnh đạo phụ đầu tiên làm lãnh đạo mới
      if (room.roles.elders.length > 0) {
        const newLeader = room.roles.elders[0];
        room.roles.leader = newLeader;
        room.roles.elders = room.roles.elders.filter(
          (elder) => elder !== newLeader
        ); // Loại bỏ người lãnh đạo mới khỏi danh sách lãnh đạo phụ
      } else if (room.roles.members.length > 0) {
        // Nếu không có người lãnh đạo phụ, chọn người tham gia đầu tiên làm lãnh đạo mới
        const newLeader = room.roles.members[0];
        room.roles.leader = newLeader;
        room.roles.members = room.roles.members.filter(
          (member) => member !== newLeader
        ); // Loại bỏ người lãnh đạo mới khỏi danh sách thành viên
      } else {
        // Nếu không có thành viên nào trong nhóm, xóa luôn vai trò lãnh đạo
        delete room.roles.leader;
      }

      // Xóa người lãnh đạo khỏi danh sách người tham gia của nhóm
      room.users = room.users.filter((user) => user !== phoneNumber);

      // Nếu không còn thành viên nào trong nhóm, đặt vai trò của lãnh đạo về rỗng
      if (room.users.length === 0) {
        delete room.roles.leader;
        deleteRoomByRoomId(roomId);
      }

      await room.save();
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

module.exports = {
  removeLeaderOutGroup,
  removeElderOutGroup,
  removeMemberOutGroup,
  authorizationRoomMembers,
  authorizationRoomLeader,
  authorizationRoomOwner,
  updateInforRoom,
  joinRoomByRoomId,
  deleteRoomByRoomId,
  findRoomByRoomId,
  findRoomByManyPhoneNumber,
  findRoomByPhoneNumber,
  createRoom,
};
