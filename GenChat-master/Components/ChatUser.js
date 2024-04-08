import React from 'react'
import { TextInput, ScrollView, Text, View, Image, Pressable } from 'react-native'
import GlobalAsset from "../GlobalAsset.js";
import socket from "../utils/socket";

export default function ChatUser({ navigation, user }) {
  return (
    <Pressable
      onPress={() => {
        // socket.emit("createRoom", "room-1");
        navigation.navigate("ChatUserDetail")
      }}
      style={{
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        padding: 10, 
        gap: 10
      }}
    >
      <Image
        source={{
          uri: GlobalAsset.defaultLogoImage
        }}
        style={{
          width: 60, 
          borderRadius: 30, 
          aspectRatio: 1 / 1, 
        }}
      >  
      </Image>
      <View
        style={{
          flex: 1, 
          alignContent: 'space-around', 
          justifyContent: 'space-around', 
          gap: 10
        }}
      >
        <Text style={{fontWeight: 'bold'}}>{user.name}</Text>
        <Text>{user.phoneNumber}</Text>
      </View>
    </Pressable>
  )
}
