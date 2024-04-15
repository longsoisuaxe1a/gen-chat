import axios from "axios";
import {api_host, socket_host} from "../../GlobalVariable";
const removeMemberOutGroup = async (roomId, phoneNumber) => {
  try {
    const userData = {
      roomId: roomId,
      phoneNumber: phoneNumber,
    };
    const response = await axios.post(
      api_host + "/rooms/remove-member-out-group",
      userData
    );
    if (response.status === 200) {
      console.log("Found successful:", response.data);

      return response.data;
    } else {
      console.error("Found failed:", response.data);
      throw new Error("Found failed");
    }
  } catch (error) {
    console.error("Found error:", error);
    throw new Error(error);
  }
};
export default removeMemberOutGroup;