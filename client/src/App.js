import { useState } from "react";
import axios from 'axios'
import { Button } from "@material-ui/core";
import VideoCall from "./VideoCall";
import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react'

function App() {
  const [inCall, setInCall] = useState(false);
  const [channelinfo, setChannelinfo] = useState({
    appId: '',
    channel: ''
  })
  const [token, setToken] = useState('');

  const useClient = createClient({ mode: "rtc", codec: "vp8", appId: channelinfo.appId, token: token });
  const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
 

  const buttonClick = async () => {
    const tokens = await axios.get(`http://localhost:8080/rtc`, {
      params: {
        channel: channelinfo.channel,
        role: 'publisher',
        tokentype: 'uid',
        uid: 0,
      }
    })
    setToken(tokens.data.rtcToken)
    setInCall(true)
  }
  
  const handleInputValue = (key) => (e) => {
    setChannelinfo({ ...channelinfo, [key]: e.target.value });
  }

  return (
    <div className="App" style={{ height: "100%" }}>
      {inCall ? (
        <VideoCall 
          setInCall={setInCall} 
          channelinfo={channelinfo} 
          token={token} 
          useClient={useClient}
          useMicrophoneAndCameraTracks={useMicrophoneAndCameraTracks}
        />
      ) : (
        <div>
          <div>
            <input type='appId' onChange={handleInputValue('appId')} placeholder='appId'></input>
          </div>
          <div>
            <input type='channel' onChange={handleInputValue('channel')} placeholder='channel'></input>
          </div>  
          <Button
            variant="contained"
            color="primary"
            onClick={() => buttonClick()}
          >
            Join Call
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
