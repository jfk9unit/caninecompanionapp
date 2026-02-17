import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Trophy,
  BookOpen,
  Shield,
  RefreshCw
} from "lucide-react";

export const NasduPretest = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pretestStatus, setPretestStatus] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes

  useEffect(() => {
    fetchPretestStatus();
  }, []);

  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted]);

  const fetchPretestStatus = async () => {
    try {
      const response = await axios.get(`${API}/nasdu/pretest/status`, { withCredentials: true });
      setPretestStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch pretest status:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async () => {
    setLoading(true);
    try {
      // Start pretest session
      const startRes = await axios.post(`${API}/nasdu/pretest/start`, {}, { withCredentials: true });
      
      if (startRes.data.already_passed) {
        toast.info("You've already passed the pre-test!");
        setPretestStatus({ has_passed: true });
        setLoading(false);
        return;
      }
      
      setSessionId(startRes.data.session_id);
      
      // Get questions
      const questionsRes = await axios.get(`${API}/nasdu/pretest/questions`, { withCredentials: true });
      setQuestions(questionsRes.data.questions);
      setTestStarted(true);
      setTimeRemaining(60 * 60);
    } catch (error) {
      toast.error("Failed to start test");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length && timeRemaining > 0) {
      if (!confirm(`You've only answered ${answeredCount}/${questions.length} questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/nasdu/pretest/submit`, {
        session_id: sessionId,
        answers: answers
      }, { withCredentials: true });
      
      setResult(response.data);
      setTestStarted(false);
      
      if (response.data.passed) {
        toast.success("Congratulations! You passed the pre-test!");
        setPretestStatus({ has_passed: true });
      } else {
        toast.error(`You scored ${response.data.score}/50. You need 48/50 to pass.`);
      }
    } catch (error) {
      toast.error("Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <AppLayout user={user}>
        {() => (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </AppLayout>
    );
  }

  // Already passed view
  if (pretestStatus?.has_passed && !result) {
    return (
      <AppLayout user={user}>
        {() => (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" data-testid="pretest-passed">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 rounded-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-green-800 mb-2">Pre-Test Already Passed!</h1>
                <p className="text-green-700 mb-6">
                  You've already successfully completed the NASDU pre-test. 
                  You can now browse and enroll in any of our accredited courses.
                </p>
                <Button 
                  onClick={() => navigate("/elite-courses")}
                  className="rounded-full bg-green-600 hover:bg-green-700"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </AppLayout>
    );
  }

  // Result view
  if (result) {
    const passed = result.passed;
    return (
      <AppLayout user={user}>
        {() => (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" data-testid="pretest-result">
            <Card className={`rounded-2xl ${passed ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'}`}>
              <CardContent className="p-8 text-center">
                <div className={`w-20 h-20 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center mx-auto mb-6`}>
                  {passed ? (
                    <Trophy className="w-10 h-10 text-white" />
                  ) : (
                    <XCircle className="w-10 h-10 text-white" />
                  )}
                </div>
                <h1 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-800' : 'text-red-800'}`}>
                  {passed ? 'Congratulations!' : 'Not Quite There Yet'}
                </h1>
                <p className={`text-5xl font-bold my-6 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.score}/{result.total}
                </p>
                <p className={`mb-6 ${passed ? 'text-green-700' : 'text-red-700'}`}>
                  {passed 
                    ? "You've passed the NASDU pre-test! You can now enroll in accredited courses."
                    : `You need ${result.pass_score}/${result.total} to pass. Keep studying and try again!`
                  }
                </p>
                
                {passed ? (
                  <Button 
                    onClick={() => navigate("/elite-courses")}
                    className="rounded-full bg-green-600 hover:bg-green-700"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      onClick={() => {
                        setResult(null);
                        setAnswers({});
                        setCurrentQuestion(0);
                        startTest();
                      }}
                      className="rounded-full bg-amber-500 hover:bg-amber-600 text-black"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again (£19.99)
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Review the NASDU handbook and security dog handling standards before retrying.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </AppLayout>
    );
  }

  // Test in progress view
  if (testStarted && questions.length > 0) {
    const currentQ = questions[currentQuestion];
    
    return (
      <AppLayout user={user}>
        {() => (
          <div className="max-w-3xl mx-auto space-y-6" data-testid="pretest-in-progress">
            {/* Timer and Progress Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="rounded-full px-4 py-2">
                    Question {currentQuestion + 1} of {questions.length}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-4 py-2">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    {answeredCount} Answered
                  </Badge>
                </div>
                <Badge 
                  className={`rounded-full px-4 py-2 ${
                    timeRemaining < 300 ? 'bg-red-500' : 'bg-primary'
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {formatTime(timeRemaining)}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question Card */}
            <Card className="rounded-2xl shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold mb-6">
                  {currentQ.question}
                </h2>
                
                <RadioGroup 
                  value={answers[currentQ.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
                  className="space-y-3"
                >
                  {currentQ.options.map((option, index) => (
                    <div 
                      key={index}
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        answers[currentQ.id] === index 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent bg-slate-50 hover:bg-slate-100'
                      }`}
                      onClick={() => handleAnswer(currentQ.id, index)}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 cursor-pointer text-base"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-full bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Test
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                  className="rounded-full"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Question Navigator */}
            <Card className="rounded-2xl">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-3">Jump to question:</p>
                <div className="flex flex-wrap gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        index === currentQuestion
                          ? 'bg-primary text-white'
                          : answers[questions[index]?.id] !== undefined
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </AppLayout>
    );
  }

  // Start test view
  return (
    <AppLayout user={user}>
      {() => (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" data-testid="pretest-start">
          {/* Header */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="font-heading font-bold text-3xl mb-2">NASDU Pre-Assessment Test</h1>
            <p className="text-muted-foreground">
              Complete this test before enrolling in NASDU accredited courses
            </p>
          </div>

          {/* Test Info Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Test Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                  <p className="text-2xl font-bold">50</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-muted-foreground">Pass Mark</p>
                  <p className="text-2xl font-bold">48/50 (96%)</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-muted-foreground">Time Limit</p>
                  <p className="text-2xl font-bold">60 Minutes</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-muted-foreground">Test Fee</p>
                  <p className="text-2xl font-bold text-primary">£19.99</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800">Important Information</p>
                    <ul className="text-sm text-amber-700 mt-2 space-y-1">
                      <li>- This test covers basic security K9 protection knowledge</li>
                      <li>- You must pass with 48/50 or higher to enroll in courses</li>
                      <li>- Questions are based on NASDU and SIA standards</li>
                      <li>- Test fee is non-refundable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Topics Covered */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Topics Covered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "NASDU Standards & Regulations",
                  "SIA Licensing Requirements",
                  "Dog Handling Techniques",
                  "Health & Welfare Standards",
                  "Legal Aspects of Security",
                  "Patrol & Detection Procedures",
                  "Safety Protocols",
                  "BS 8517 Compliance"
                ].map((topic, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{topic}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <Button 
            onClick={startTest}
            className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-6 text-lg"
            disabled={loading}
            data-testid="start-pretest-btn"
          >
            {loading ? (
              "Loading..."
            ) : (
              <>
                <FileCheck className="w-5 h-5 mr-2" />
                Start Pre-Test (£19.99)
              </>
            )}
          </Button>
        </div>
      )}
    </AppLayout>
  );
};

export default NasduPretest;
