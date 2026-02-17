import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Clock,
  CheckCircle,
  BookOpen,
  Shield,
  Bell,
  Calendar
} from "lucide-react";

export const NasduPretest = ({ user }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [notified, setNotified] = useState(false);

  const handleNotify = () => {
    setNotified(true);
  };

  return (
    <AppLayout user={user}>
      {() => (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" data-testid="pretest-coming-soon">
          {/* Header */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
            <Badge className="mb-4 bg-blue-500/20 text-blue-600 border-blue-500/30 px-4 py-1">
              Coming Soon
            </Badge>
            <h1 className="font-heading font-bold text-3xl mb-2">NASDU Pre-Assessment Test</h1>
            <p className="text-muted-foreground">
              We're developing a comprehensive assessment to help you prepare for certification
            </p>
          </div>

          {/* Coming Soon Info Card */}
          <Card className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-blue-900 mb-2">Pre-Test Launching Q1 2025</h2>
              <p className="text-blue-700 mb-6">
                Our 50-question pre-assessment covering NASDU standards, SIA licensing, 
                dog handling techniques, and welfare standards is currently in development.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white rounded-xl">
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-2xl font-bold text-blue-600">50</p>
                </div>
                <div className="p-4 bg-white rounded-xl">
                  <p className="text-sm text-muted-foreground">Pass Mark</p>
                  <p className="text-2xl font-bold text-blue-600">48/50</p>
                </div>
                <div className="p-4 bg-white rounded-xl">
                  <p className="text-sm text-muted-foreground">Time Limit</p>
                  <p className="text-2xl font-bold text-blue-600">60 min</p>
                </div>
                <div className="p-4 bg-white rounded-xl">
                  <p className="text-sm text-muted-foreground">Fee</p>
                  <p className="text-2xl font-bold text-blue-600">£19.99</p>
                </div>
              </div>
              
              {!notified ? (
                <Button 
                  onClick={handleNotify}
                  className="rounded-full bg-blue-600 hover:bg-blue-700"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Me When Available
                </Button>
              ) : (
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30 px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  You'll be notified when the pre-test launches!
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* In the Meantime */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                In the Meantime
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You can still enroll in NASDU courses directly! Our team will provide you with 
                preparation materials after enrollment.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "NASDU Standards & Regulations",
                  "SIA Licensing Requirements",
                  "Dog Handling Techniques",
                  "Health & Welfare Standards",
                  "Legal Aspects of Security",
                  "Patrol & Detection Procedures"
                ].map((topic, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{topic}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => navigate("/elite-courses")}
                className="w-full rounded-full mt-4"
              >
                <Shield className="w-4 h-4 mr-2" />
                Browse NASDU Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

export default NasduPretest;
