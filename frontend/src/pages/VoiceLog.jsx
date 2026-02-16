import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Send,
  Clock,
  Sparkles,
  ListChecks,
  Smile,
  Activity,
  Trash2,
  Loader2
} from "lucide-react";

const MOOD_COLORS = {
  happy: "bg-green-100 text-green-700",
  calm: "bg-blue-100 text-blue-700",
  excited: "bg-yellow-100 text-yellow-700",
  tired: "bg-purple-100 text-purple-700",
  anxious: "bg-orange-100 text-orange-700"
};

const MOOD_EMOJIS = {
  happy: "😊",
  calm: "😌",
  excited: "🎉",
  tired: "😴",
  anxious: "😟"
};

export const VoiceLog = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (dogId) => {
    try {
      // We'll need to get the selected dog from context
      const dogsRes = await axios.get(`${API}/dogs`, { withCredentials: true });
      if (dogsRes.data.length > 0) {
        const selectedDogId = localStorage.getItem('selectedDogId') || dogsRes.data[0].dog_id;
        const response = await axios.get(`${API}/voice-logs/${selectedDogId}`, { withCredentials: true });
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        // For now, we'll use the text input as the transcript
        // In a full implementation, you'd send audio to a speech-to-text API
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info('Recording started... Speak about your dog\'s day!');
    } catch (error) {
      toast.error('Could not access microphone. Please use text input instead.');
      console.error('Microphone error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info('Recording stopped. Edit the text below and submit.');
    }
  };

  const submitLog = async () => {
    if (!transcript.trim()) {
      toast.error('Please enter or record some activity notes');
      return;
    }

    setProcessing(true);
    try {
      const dogsRes = await axios.get(`${API}/dogs`, { withCredentials: true });
      if (dogsRes.data.length === 0) {
        toast.error('Please add a dog first');
        return;
      }
      
      const selectedDogId = localStorage.getItem('selectedDogId') || dogsRes.data[0].dog_id;
      
      await axios.post(`${API}/voice-logs`, {
        transcript: transcript,
        dog_id: selectedDogId
      }, { withCredentials: true });
      
      toast.success('Activity log saved and analyzed!');
      setTranscript("");
      fetchLogs();
    } catch (error) {
      toast.error('Failed to save log');
    } finally {
      setProcessing(false);
    }
  };

  const deleteLog = async (logId) => {
    // Note: Backend doesn't have delete endpoint yet, but we can add it
    toast.info('Log removed from view');
    setLogs(logs.filter(l => l.log_id !== logId));
  };

  return (
    <AppLayout user={user}>
      {({ dogs, selectedDog }) => (
        <div className="space-y-8 animate-fade-in" data-testid="voice-log-page">
          {/* Header */}
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
              Voice Activity Log
            </h1>
            <p className="text-muted-foreground mt-1">
              Record or type your dog's daily activities - AI will organize them into bullet points
            </p>
          </div>

          {/* Recording Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center">
                {/* Recording Button */}
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-24 h-24 rounded-full mb-6 transition-all ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-primary hover:bg-primary-hover'
                  }`}
                  data-testid="record-btn"
                >
                  {isRecording ? (
                    <MicOff className="w-10 h-10" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </Button>
                
                <p className="text-lg font-medium mb-2">
                  {isRecording ? 'Recording... Tap to stop' : 'Tap to Record'}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Or type your notes below
                </p>

                {/* Text Input */}
                <div className="w-full max-w-2xl space-y-4">
                  <Textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="e.g., Today Max went for a 30 minute walk in the park. He played with other dogs and seemed very happy. Had his breakfast at 8am and dinner at 6pm. He was a bit tired in the afternoon so we had a nap together..."
                    className="min-h-[120px] rounded-xl bg-white border-2 border-purple-100 focus:border-purple-300"
                    data-testid="transcript-input"
                  />
                  
                  <Button
                    onClick={submitLog}
                    disabled={processing || !transcript.trim()}
                    className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary-hover px-8"
                    data-testid="submit-log-btn"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze & Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Logs */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-4">
              {selectedDog ? `${selectedDog.name}'s Activity Logs` : 'Recent Activity Logs'}
            </h2>
            
            {logs.length === 0 ? (
              <Card className="bg-white rounded-2xl shadow-card p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-purple-100 rounded-full">
                    <Mic className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">No Logs Yet</h3>
                <p className="text-muted-foreground">
                  Record or type your first activity log to get started!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <Card 
                    key={log.log_id}
                    className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    data-testid={`log-${log.log_id}`}
                  >
                    <CardContent className="p-6">
                      {/* Log Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-xl">
                            <Clock className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {new Date(log.created_at).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {log.mood_detected && (
                            <Badge className={`${MOOD_COLORS[log.mood_detected] || 'bg-gray-100 text-gray-700'} rounded-full`}>
                              <Smile className="w-3 h-3 mr-1" />
                              {MOOD_EMOJIS[log.mood_detected] || ''} {log.mood_detected}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteLog(log.log_id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Bullet Points */}
                      {log.bullet_points && log.bullet_points.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <ListChecks className="w-4 h-4" />
                            Summary
                          </div>
                          <ul className="space-y-2">
                            {log.bullet_points.map((point, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Activities */}
                      {log.activities_mentioned && log.activities_mentioned.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Activity className="w-4 h-4 text-gray-400" />
                          {log.activities_mentioned.map((activity, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className="rounded-full text-xs capitalize"
                            >
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Original Transcript (collapsed) */}
                      <details className="mt-4">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-gray-600">
                          View original text
                        </summary>
                        <p className="mt-2 text-sm text-gray-500 italic bg-gray-50 rounded-lg p-3">
                          "{log.transcript}"
                        </p>
                      </details>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default VoiceLog;
