import { useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import Video from "./Video";
import Controls from "./Controls";

export default function VideoCall(props) {
  const { setInCall, channelinfo, token, useClient, useMicrophoneAndCameraTracks } = props;
  const [users, setUsers] = useState([]);
  const [start, setStart] = useState(false);

  const client = useClient();
  const { ready, tracks } = useMicrophoneAndCameraTracks();

  useEffect(() => {
    let init = async (name) => {

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setUsers((prevUsers) => {
            return [...prevUsers, user];
          });
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "audio") {
          if (user.audioTrack) user.audioTrack.stop();
        }
        if (mediaType === "video") {
          setUsers((prevUsers) => {
            return prevUsers.filter((User) => User.uid !== user.uid);
          });
        }
      });

      client.on("user-left", (user) => {
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      });
      try {
        console.log(token)
        await client.join(channelinfo.appId, channelinfo.channel, token, 0).then(data => console.log(data));
        if (tracks) await client.publish([tracks[0], tracks[1]]);
        setStart(true);
      } catch (error) {
        console.log("error");
      }
    };

    if (ready && tracks) {
      try {
        init(channelinfo.channel);
      } catch (error) {
        console.log(error);
      }
    }
  }, [channelinfo.channel, client, ready,  tracks]);

  return (
    <Grid container direction="column" style={{ height: "100%" }}>
      <Grid item style={{ height: "5%" }}>
        {ready && tracks && (
          <Controls tracks={tracks} setStart={setStart} setInCall={setInCall} client={client} />
        )}
      </Grid>
      <Grid item style={{ height: "95%" }}>
        {start && tracks && <Video tracks={tracks} users={users} />}
      </Grid>
    </Grid>
  );
}
