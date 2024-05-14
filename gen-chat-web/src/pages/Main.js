import React, { useRef, useState } from 'react'
import SidebarMenu from '../components/SidebarMenu'
import SidebarChat from '../components/SidebarChat'
import Chats from '../components/Chats'
import { useLocation } from "react-router-dom";

export default function Main() {
  const {state} = useLocation();
  
  const [currentFriend, setCurrentFriend] = useState({})
  const [user, setUser] = useState(state.user.data)
  
  // setUser(  ); // Read values passed on state

  const handleCurrentFriend = friend => {
    setCurrentFriend(friend);
  }

  const handleUser = new_user => {
    console.log("--------------- new user ----------------");
    console.log(new_user);
    setUser(new_user);
  }
  
  return (
    <div className='flex items-center w-full overflow-hidden'>
      <SidebarMenu user={user} />
      <SidebarChat user={user} handleCurrentFriend={handleCurrentFriend} handleUser={handleUser}/>
      <Chats user={user} currentFriend={currentFriend} />
    </div>
  )
}
