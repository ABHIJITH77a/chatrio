import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  incomingCall: null, // { fromUser, channelId }
  outgoingCall: null, // { toUser, channelId }
  channel: null, 
  authUser:null     
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    showIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    clearIncomingCall: (state) => {
      state.incomingCall = null;
    },
    showOutgoingCall: (state, action) => {
      state.outgoingCall = action.payload;
    },
    clearOutgoingCall: (state) => {
      state.outgoingCall = null;
    },
   
    clearChannel: (state) => {
      state.channel = null;
    },
      setAuthUser: (state, action) => {
      state.authUser = action.payload;
    },
    clearAuthUser: (state) => {
      state.authUser = null;
    },
  },
});

export const {
  showIncomingCall,
  clearIncomingCall,
  showOutgoingCall,
  clearOutgoingCall,
  clearChannel,
  setAuthUser,
  clearAuthUser
} = callSlice.actions;

export default callSlice.reducer;
