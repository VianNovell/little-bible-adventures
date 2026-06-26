import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useAuth } from '../context/AuthContext';
import './VideoRoom.css';

export default function VideoRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { userRole } = useAuth();
  const isTeacher = userRole === 'teacher' || queryParams.get('role') === 'teacher';
  const teacherName = localStorage.getItem('teacherName') || "Mrs. Sa'rah";

  let savedSettings = { muteAudioOnEntry: true, muteVideoOnEntry: true };
  try {
    const s = localStorage.getItem('class_settings');
    if (s) savedSettings = JSON.parse(s);
  } catch {}

  const audioMuted = isTeacher ? false : savedSettings.muteAudioOnEntry;
  const videoMuted = isTeacher ? false : savedSettings.muteVideoOnEntry;

  // Create a unique but consistent room name
  const roomName = `LittleBibleAdventures_Room_${id}`;

  return (
    <div className="video-room-page">
      <div className="video-room-header">
        <button onClick={() => navigate(isTeacher ? '/teacher-dashboard' : '/dashboard')} className="btn btn-outline back-btn">
          <ArrowLeft size={20} /> Back to {isTeacher ? 'Dashboard' : 'Kids Hub'}
        </button>
        <h2>Live Session</h2>
      </div>
      
      <div className="video-container">
        {/* We use Jitsi Meet for a free, instant, embedded video call */}
        <JitsiMeeting
          domain="meet.ffmuc.net"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: audioMuted,
            startWithVideoMuted: videoMuted,
            disableModeratorIndicator: !isTeacher,
            startScreenSharing: false,
            enableEmailInStats: false,
            prejoinPageEnabled: false
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
          }}
          userInfo={{
            displayName: isTeacher ? teacherName : 'Little Adventurer',
            email: ''
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
            iframeRef.setAttribute('allow', 'camera; microphone; display-capture; fullscreen');
          }}
          onReadyToClose={() => {
            if (isTeacher) {
              navigate(-1);
            } else {
              navigate('/dashboard');
            }
          }}
        />
      </div>
    </div>
  );
}
