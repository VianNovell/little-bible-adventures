import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import './VideoRoom.css';

export default function VideoRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Create a unique but consistent room name
  const roomName = `LittleBibleAdventures_Room_${id}`;

  return (
    <div className="video-room-page">
      <div className="video-room-header">
        <button onClick={() => navigate('/dashboard')} className="btn btn-outline back-btn">
          <ArrowLeft size={20} /> Back to Kids Hub
        </button>
        <h2>Live Session</h2>
      </div>
      
      <div className="video-container">
        {/* We use Jitsi Meet for a free, instant, embedded video call */}
        <JitsiMeeting
          domain="meet.element.io"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: false,
            enableEmailInStats: false,
            prejoinPageEnabled: false
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
          }}
          userInfo={{
            displayName: 'Little Adventurer',
            email: ''
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
          }}
        />
      </div>
    </div>
  );
}
